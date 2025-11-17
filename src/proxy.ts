import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
  convexAuthNextjsToken,
} from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../convex/_generated/api";

const isSignInPage = createRouteMatcher(["/signin"]);
const isPublicRoute = createRouteMatcher(["/", "/signin", "/accept-invitation(.*)"]);
const isAcceptInvitationRoute = createRouteMatcher(["/accept-invitation(.*)"]);

// Rutas protegidas por rol
const isSuperAdminRoute = createRouteMatcher(["/superadmin(.*)"]);
const isOrganizadorRoute = createRouteMatcher(["/organizador(.*)", "/org(.*)"]);
const isJugadorRoute = createRouteMatcher(["/jugador(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  // Si no está autenticado y trata de acceder a ruta protegida (excepto accept-invitation)
  if (!isPublicRoute(request) && !isAcceptInvitationRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }

  // Si está autenticado y trata de acceder a signin, redirigir según su rol
  if (isSignInPage(request) && isAuthenticated) {
    try {
      const token = await convexAuthNextjsToken();
      const user = await fetchQuery(api.users.getCurrentUser, {}, { token });

      if (user) {
        // Redirigir según el rol del usuario
        if (user.role === "superadmin") {
          return nextjsMiddlewareRedirect(request, "/superadmin");
        } else if (user.role === "organizador") {
          // Obtener organizaciones del usuario y redirigir a la primera
          const userOrgs = await fetchQuery(
            api.invitations.getUserOrganizaciones,
            { userId: user._id },
            { token }
          );
          
          if (userOrgs && userOrgs.length > 0) {
            const firstOrg = userOrgs[0];
            if (firstOrg && firstOrg.slug) {
              return nextjsMiddlewareRedirect(request, `/org/${firstOrg.slug}/admin`);
            }
          }
          // Si no tiene organizaciones, redirigir a jugador
          return nextjsMiddlewareRedirect(request, "/jugador");
        } else {
          return nextjsMiddlewareRedirect(request, "/jugador");
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  // Proteger rutas específicas por rol
  if (isAuthenticated) {
    try {
      const token = await convexAuthNextjsToken();
      const user = await fetchQuery(api.users.getCurrentUser, {}, { token });

      if (user) {
        // Verificar acceso a rutas de superadmin
        if (isSuperAdminRoute(request) && user.role !== "superadmin") {
          if (user.role === "organizador") {
            // Obtener primera organización del usuario
            const userOrgs = await fetchQuery(
              api.invitations.getUserOrganizaciones,
              { userId: user._id },
              { token }
            );
            if (userOrgs && userOrgs.length > 0 && userOrgs[0]?.slug) {
              return nextjsMiddlewareRedirect(request, `/org/${userOrgs[0].slug}/admin`);
            }
          }
          return nextjsMiddlewareRedirect(request, `/${user.role}`);
        }

        // Verificar acceso a rutas de organizador (incluye /org/[slug]/admin)
        if (
          isOrganizadorRoute(request) &&
          user.role !== "organizador" &&
          user.role !== "superadmin"
        ) {
          // Para rutas /org/[slug]/admin, verificar también si el usuario está asociado a esa org
          // Por ahora, solo verificamos el rol
          return nextjsMiddlewareRedirect(request, `/${user.role}`);
        }

        // Verificar acceso a rutas de jugador
        if (isJugadorRoute(request) && user.role !== "jugador" && user.role !== "organizador" && user.role !== "superadmin") {
          return nextjsMiddlewareRedirect(request, "/signin");
        }
      }
    } catch (error) {
      console.error("Error checking role:", error);
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

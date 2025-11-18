"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrgRedirectPage() {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);

  // Obtener organizaciones según el rol
  const userOrgs = useQuery(
    api.invitations.getUserOrganizaciones,
    user && user.role === "organizador" ? { userId: user._id } : "skip"
  );

  const allOrganizadores = useQuery(
    api.organizadores.listOrganizadores,
    user?.role === "superadmin" ? {} : "skip"
  );

  useEffect(() => {
    // Esperar a que carguen los datos
    if (user === undefined) return;

    // Si no está autenticado, redirigir a signin
    if (!user) {
      router.replace("/signin");
      return;
    }

    // Determinar el primer organizador según el rol
    let firstOrg = null;

    if (user.role === "superadmin") {
      // SuperAdmin: primera organización activa de la lista
      if (allOrganizadores !== undefined && allOrganizadores.length > 0) {
        firstOrg = allOrganizadores[0];
      }
    } else if (user.role === "organizador") {
      // Organizador: su primera organización
      if (userOrgs !== undefined && userOrgs.length > 0) {
        firstOrg = userOrgs[0];
      }
    }

    // Si encontró una organización, redirigir
    if (firstOrg && firstOrg.slug) {
      router.replace(`/org/${firstOrg.slug}/admin`);
    } else if (
      (user.role === "superadmin" && allOrganizadores !== undefined) ||
      (user.role === "organizador" && userOrgs !== undefined)
    ) {
      // Si ya cargó y no tiene organizaciones, redirigir al dashboard correspondiente
      if (user.role === "superadmin") {
        router.replace("/superadmin");
      } else {
        router.replace("/jugador");
      }
    }
  }, [user, userOrgs, allOrganizadores, router]);

  // Mostrar loading mientras redirecciona
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}

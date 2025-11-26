"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrgRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
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
    // Esperar a que termine de cargar el estado de autenticación
    if (isLoading) return;
    
    // Si no está autenticado, redirigir a signin
    if (!isAuthenticated) {
      router.replace("/signin");
      return;
    }

    // Esperar a que cargue el usuario
    if (user === undefined) return;

    // Si el usuario es null (error), redirigir a signin
    if (!user) {
      router.replace("/signin");
      return;
    }

    // Determinar el primer organizador según el rol
    let firstOrg = null;

    if (user.role === "superadmin") {
      // SuperAdmin: esperar a que cargue la lista de organizadores
      if (allOrganizadores === undefined) return;
      
      // Si hay organizadores, usar el primero
      if (allOrganizadores.length > 0) {
        firstOrg = allOrganizadores[0];
      }
    } else if (user.role === "organizador") {
      // Organizador: esperar a que cargue sus organizaciones
      if (userOrgs === undefined) return;
      
      // Si tiene organizaciones, usar la primera
      if (userOrgs.length > 0) {
        firstOrg = userOrgs[0];
      }
    } else {
      // Jugador u otro rol: redirigir a jugador
      router.replace("/jugador");
      return;
    }

    // Si encontró una organización, redirigir
    if (firstOrg && firstOrg.slug) {
      router.replace(`/org/${firstOrg.slug}/admin`);
    } else {
      // No tiene organizaciones, redirigir al dashboard correspondiente
      if (user.role === "superadmin") {
        router.replace("/superadmin");
      } else {
        router.replace("/jugador");
      }
    }
  }, [isLoading, isAuthenticated, user, userOrgs, allOrganizadores, router]);

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

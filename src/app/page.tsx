"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const ensureRole = useMutation(api.users.ensureUserRole);
  const router = useRouter();
  
  // Obtener organizaciones del usuario si es organizador
  const userOrgs = useQuery(
    api.invitations.getUserOrganizaciones,
    user && user.role === "organizador" ? { userId: user._id } : "skip"
  );

  useEffect(() => {
    // Esperar a que termine de cargar el estado de autenticación
    if (isLoading) return;
    
    // Si no está autenticado, redirigir a signin
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }
    
    // Si está autenticado pero user aún no carga, esperar
    if (user === undefined) return;
    
    // Si user es null (error inesperado), redirigir a signin
    if (user === null) {
      router.push("/signin");
      return;
    }

    // Asegurar que el usuario tenga rol
    if (!user.role) {
      ensureRole().then(() => {
        router.push("/jugador");
      });
    } else if (user.role === "organizador") {
      // Si es organizador, redirigir a su primera organización
      if (userOrgs !== undefined) {
        if (userOrgs && userOrgs.length > 0) {
          const firstOrg = userOrgs[0];
          if (firstOrg && firstOrg.slug) {
            router.push(`/org/${firstOrg.slug}/admin`);
          } else {
            router.push("/jugador");
          }
        } else {
          // No tiene organizaciones asignadas
          router.push("/jugador");
        }
      }
      // Si userOrgs es undefined, esperar a que cargue
    } else {
      // Redirigir automáticamente según el rol (superadmin o jugador)
      router.push(`/${user.role}`);
    }
  }, [isLoading, isAuthenticated, user, userOrgs, router, ensureRole]);

  // Mostrar spinner mientras carga el estado de autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }
  
  // Si no está autenticado, mostrar spinner mientras redirige
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Si userOrgs se está cargando para un organizador, mostrar loading
  if (user && user.role === "organizador" && userOrgs === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MatchSquad</h1>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const user = useQuery(api.users.getCurrentUser);
  const ensureRole = useMutation(api.users.ensureUserRole);
  const router = useRouter();

  useEffect(() => {
    // Si user es null, significa que no está autenticado
    if (user === null) {
      router.push("/signin");
      return;
    }

    if (user) {
      // Asegurar que el usuario tenga rol
      if (!user.role) {
        ensureRole().then(() => {
          router.push("/jugador");
        });
      } else {
        // Redirigir automáticamente según el rol
        router.push(`/${user.role}`);
      }
    }
  }, [user, router, ensureRole]);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Cargando...</p>
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

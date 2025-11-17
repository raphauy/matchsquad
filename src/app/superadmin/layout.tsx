"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminSidebarClient } from "@/components/admin/admin-sidebar-client";
import { AdminHeader } from "@/components/admin/admin-header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useQuery(api.users.getCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (user !== undefined && (!user || user.role !== "superadmin")) {
      router.push("/signin");
    }
  }, [user, router]);

  if (user === undefined) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!user || user.role !== "superadmin") {
    return null;
  }

  return (
    <AdminSidebarClient>
      <AdminHeader user={user} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-none lg:max-w-6xl lg:mx-auto">{children}</div>
      </main>
    </AdminSidebarClient>
  );
}

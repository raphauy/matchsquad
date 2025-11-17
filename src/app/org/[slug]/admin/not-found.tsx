import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold mb-2">Organizador no encontrado</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        El organizador que buscas no existe o ha sido desactivado.
      </p>
      <Button asChild>
        <Link href="/superadmin/organizadores">Volver a Organizadores</Link>
      </Button>
    </div>
  );
}

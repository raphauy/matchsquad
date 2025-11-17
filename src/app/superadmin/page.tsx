export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard SuperAdmin</h2>
        <p className="text-muted-foreground">
          Panel de administración principal
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-2">Gestión de Usuarios</h3>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-2">Partidos</h3>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-2">Configuración</h3>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
      </div>
    </div>
  );
}

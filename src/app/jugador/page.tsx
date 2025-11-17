export default function JugadorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Jugador</h2>
        <p className="text-muted-foreground">
          Encuentra y únete a partidos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-2">Partidos Disponibles</h3>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-2">Mis Reservas</h3>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
      </div>
    </div>
  );
}

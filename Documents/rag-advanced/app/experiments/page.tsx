export default function ExperimentsPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-border bg-background flex justify-between items-center">
        <h1 className="text-xl font-semibold">🔬 Experimentos MLflow</h1>
        <a 
            href="http://localhost:5001" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
        >
            Abrir en nueva pestaña ↗
        </a>
      </div>
      <div className="flex-1 relative bg-secondary/10">
        <iframe 
            src="http://localhost:5001" 
            className="w-full h-full border-none"
            title="MLflow Experiments"
        />
        <div className="absolute inset-0 -z-10 flex items-center justify-center text-muted-foreground pointer-events-none">
            <div className="text-center">
                <p>Cargando MLflow...</p>
                <p className="text-xs mt-2">Si no carga, asegúrate de que Docker esté corriendo.</p>
            </div>
        </div>
      </div>
    </div>
  );
}

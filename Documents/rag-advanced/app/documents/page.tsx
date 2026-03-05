import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { UrlIngester } from "@/components/documents/UrlIngester";
import { DocumentList } from "@/components/documents/DocumentList";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-10 px-4 space-y-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold tracking-tight">Gestión de Documentos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DocumentUploader />
        <UrlIngester />
      </div>

      <div className="mt-8 pb-10">
        <h2 className="text-xl font-semibold mb-4">Documentos Ingestados</h2>
        <DocumentList />
      </div>
    </div>
  );
}

import { DocumentStatus } from "@prisma/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  if (status === DocumentStatus.PROCESSING) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
        <Loader2 className="w-3 h-3 animate-spin" />
        Procesando
      </span>
    );
  }
  
  if (status === DocumentStatus.READY) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
        <CheckCircle2 className="w-3 h-3" />
        Listo
      </span>
    );
  }
  
  if (status === DocumentStatus.ERROR) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
        <XCircle className="w-3 h-3" />
        Error
      </span>
    );
  }
  
  return null;
}

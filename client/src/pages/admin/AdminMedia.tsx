import { useRef, useState, type ChangeEvent } from "react";
import { Check, Copy, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { useCms } from "@/context/CmsContext";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AdminMedia = () => {
  const { media, uploadMedia, deleteMedia } = useCms();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      await uploadMedia({ file });
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("Failed to upload image", error);
      toast.error("No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      toast.success("Imagen eliminada");
    } catch (error) {
      console.error("Failed to delete image", error);
      toast.error("No se pudo eliminar la imagen");
    }
  };

  const handleCopy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("URL copiada al portapapeles");
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    } catch {
      toast.error("No se pudo copiar la URL");
    }
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-primary">Biblioteca de imágenes</h1>
              <p className="mt-2 text-muted-foreground">
                Sube, elimina y copia la URL de las imágenes usadas en noticias y secciones.
              </p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Subiendo..." : "Subir imagen"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {media.length === 0 ? (
            <Card className="shadow-professional">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <ImagePlus className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Todavía no hay imágenes. Sube la primera con el botón de arriba.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {media.map((asset) => (
                <Card key={asset.id} className="overflow-hidden shadow-professional">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={asset.url}
                      alt={asset.alt || asset.originalName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="space-y-3 pt-4">
                    <p className="truncate text-sm font-medium" title={asset.originalName}>
                      {asset.originalName}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{formatBytes(asset.size)}</span>
                      <span>{new Date(asset.uploadedAt).toLocaleDateString("es-CO")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleCopy(asset.url, asset.id)}>
                        {copiedId === asset.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedId === asset.id ? "Copiada" : "Copiar URL"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(asset.id)}>
                        <Trash2 className="h-4 w-4" /> Borrar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminMedia;

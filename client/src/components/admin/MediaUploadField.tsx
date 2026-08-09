import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useCms } from "@/context/CmsContext";

type MediaUploadFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const MediaUploadField = ({ id, label, value, onChange }: MediaUploadFieldProps) => {
  const { media, uploadMedia } = useCms();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const asset = await uploadMedia({ file, alt: label });
      onChange(asset.url);
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("Failed to upload image", error);
      toast.error("No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      {value ? (
        <div className="overflow-hidden rounded-md border">
          <div className="relative aspect-[16/9] bg-muted">
            <img src={value} alt={label} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t bg-card p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Reemplazar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <ImagePlus className="h-4 w-4" /> De la biblioteca
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <Trash2 className="h-4 w-4" /> Quitar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Subiendo..." : "Subir imagen"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
            <ImagePlus className="h-4 w-4" /> Elegir de la biblioteca
          </Button>
        </div>
      )}

      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="URL de la imagen"
        className="text-sm"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Biblioteca de imágenes</DialogTitle>
            <DialogDescription>
              Selecciona una imagen ya subida o sube una nueva desde aquí.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Subiendo..." : "Subir imagen"}
            </Button>
          </div>
          {media.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Todavía no hay imágenes en la biblioteca.
            </p>
          ) : (
            <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
              {media.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onChange(asset.url);
                    setPickerOpen(false);
                  }}
                  className="group overflow-hidden rounded-md border text-left transition-colors hover:border-primary"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={asset.url}
                      alt={asset.alt || asset.originalName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="truncate px-2 py-1 text-xs text-muted-foreground">
                    {asset.originalName}
                  </p>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaUploadField;

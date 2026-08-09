import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { useCms } from "@/context/CmsContext";
import type { CmsPost, PostStatus } from "@/lib/cms";

const statusOptions: PostStatus[] = ["draft", "published", "archived"];

const AdminPostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { draftPost, getPostById, savePost } = useCms();
  const [form, setForm] = useState<CmsPost>(() => getPostById(id || "") || draftPost());

  useEffect(() => {
    setForm((current) => getPostById(id || "") || current);
  }, [getPostById, id]);

  const handleChange = <K extends keyof CmsPost,>(field: K, value: CmsPost[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const saved = savePost(form);
    navigate(`/admin/noticias/${saved.id}`, { replace: true });
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <Card className="shadow-professional">
            <CardHeader>
              <CardTitle className="text-primary">{id ? "Editar noticia" : "Nueva noticia"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={form.title} onChange={(event) => handleChange("title", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" value={form.slug} onChange={(event) => handleChange("slug", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Input id="category" value={form.category} onChange={(event) => handleChange("category", event.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="excerpt">Extracto</Label>
                    <Textarea id="excerpt" value={form.excerpt} onChange={(event) => handleChange("excerpt", event.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <MediaUploadField
                      id="coverImage"
                      label="Imagen de portada"
                      value={form.coverImage}
                      onChange={(value) => handleChange("coverImage", value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea id="content" className="min-h-56" value={form.content} onChange={(event) => handleChange("content", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Etiquetas separadas por coma</Label>
                    <Input
                      id="tags"
                      value={form.tags.join(", ")}
                      onChange={(event) => handleChange("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      value={form.status}
                      onChange={(event) => handleChange("status", event.target.value as PostStatus)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) => handleChange("featured", event.target.checked)}
                    />
                    Destacar en la home
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Guardar</Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/admin/noticias")}>
                    Volver
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AdminPostEditor;

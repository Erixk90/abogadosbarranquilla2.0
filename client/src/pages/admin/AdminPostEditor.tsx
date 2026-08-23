import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { useCms } from "@/context/CmsContext";
import type { CmsPost, PostStatus } from "@/lib/cms";

const statusOptions: PostStatus[] = ["draft", "published", "archived"];

const CATEGORIES = [
  "Política",
  "Legal",
  "Penal",
  "Administrativo",
  "Deportes",
  "Entretenimiento",
  "General",
];

const statusStyles: Record<PostStatus, string> = {
  draft: "bg-gray-200 text-gray-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-700",
};

const statusLabels: Record<PostStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const AdminPostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { draftPost, getPostById, savePost } = useCms();
  const [form, setForm] = useState<CmsPost>(() => getPostById(id || "") || draftPost());
  const [tagsText, setTagsText] = useState(() => (getPostById(id || "")?.tags || []).join(", "));

  useEffect(() => {
    const post = getPostById(id || "");
    const base = post || draftPost();
    setForm(base);
    setTagsText((base.tags || []).join(", "));
  }, [getPostById, id]);

  const handleChange = <K extends keyof CmsPost,>(field: K, value: CmsPost[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleTitleChange = (value: string) => {
    setForm((current) => ({ ...current, title: value, slug: slugify(value) }));
  };

  const handleTagsChange = (value: string) => {
    setTagsText(value);
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setForm((current) => ({ ...current, tags }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const saved = savePost(form);
    toast.success("Noticia guardada correctamente");
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
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(event) => handleTitleChange(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (se genera con el título)</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(event) => handleChange("slug", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(event) => handleChange("category", event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="excerpt">Extracto</Label>
                    <Textarea
                      id="excerpt"
                      value={form.excerpt}
                      onChange={(event) => handleChange("excerpt", event.target.value)}
                    />
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
                    <Textarea
                      id="content"
                      className="min-h-56"
                      value={form.content}
                      onChange={(event) => handleChange("content", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
                    <Input
                      id="tags"
                      value={tagsText}
                      placeholder="etiqueta1, etiqueta2, etiqueta3"
                      onChange={(event) => handleTagsChange(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <div className="flex items-center gap-3">
                      <select
                        id="status"
                        value={form.status}
                        onChange={(event) => handleChange("status", event.target.value as PostStatus)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {statusLabels[option]}
                          </option>
                        ))}
                      </select>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[form.status]}`}
                      >
                        {statusLabels[form.status]}
                      </span>
                    </div>
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


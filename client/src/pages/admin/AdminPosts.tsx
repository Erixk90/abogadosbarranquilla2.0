import { Link } from "react-router-dom";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCms } from "@/context/CmsContext";

const AdminPosts = () => {
  const { posts, deletePost } = useCms();

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-primary">Noticias</h1>
              <p className="mt-2 text-muted-foreground">CRUD inicial para crear y administrar publicaciones.</p>
            </div>
            <Button asChild>
              <Link to="/admin/noticias/nuevo">
                <Plus className="h-4 w-4" /> Nueva noticia
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="shadow-professional">
                <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <img src={post.coverImage} alt={post.title} className="h-20 w-28 rounded-md object-cover" />
                    <div>
                      <h2 className="text-lg font-semibold text-primary">{post.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{post.status}</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("es-CO") : "Sin fecha"}
                        </span>
                        <span>{post.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                      <Link to={`/admin/noticias/${post.id}`}>
                        <Pencil className="h-4 w-4" /> Editar
                      </Link>
                    </Button>
                    <Button variant="destructive" onClick={() => deletePost(post.id)}>
                      <Trash2 className="h-4 w-4" /> Borrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPosts;

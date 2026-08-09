import { Link } from "react-router-dom";
import { BookOpen, LayoutDashboard, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCms } from "@/context/CmsContext";

const AdminDashboard = () => {
  const { posts, publishedPosts } = useCms();

  const stats = [
    { label: "Noticias", value: posts.length, icon: BookOpen },
    { label: "Publicadas", value: publishedPosts.length, icon: LayoutDashboard },
  ];

  const shortcuts = [
    ["/admin/home", "Editar home"],
    ["/admin/servicios", "Gestionar servicios"],
    ["/admin/noticias", "Gestionar noticias"],
    ["/admin/noticias/nuevo", "Nueva noticia"],
  ] as const;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-primary">Resumen del CMS</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Panel inicial para editar noticias sin salir del mismo proyecto.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {stats.map((item) => (
              <Card key={item.label} className="shadow-professional">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-3xl font-bold text-primary">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-professional">
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-primary">Accesos rápidos</h2>
              <div className="flex flex-wrap gap-3">
                {shortcuts.map(([to, label]) => (
                  <Link key={to} to={to} className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
                    {label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-professional">
            <CardContent className="space-y-3 pt-6">
              <h2 className="text-primary">Siguiente fase recomendada</h2>
              <p className="text-muted-foreground">
                Con esta base ya puedes publicar contenido desde el navegador. El siguiente paso es mover este estado a una API y base de datos.
              </p>
              <Link to="/admin/noticias/nuevo" className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline">
                <Settings className="h-4 w-4" /> Empezar con una noticia nueva
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;

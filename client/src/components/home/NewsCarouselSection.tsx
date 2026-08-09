import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Tag, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCms } from "@/context/CmsContext";
import type { CmsPost } from "@/lib/cms";

const NewsCarouselSection = () => {
  const { publishedPosts } = useCms();
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activePost, setActivePost] = useState<CmsPost | null>(null);
  const posts = useMemo(() => publishedPosts.slice(0, 10), [publishedPosts]);

  const scrollRail = (direction: "left" | "right") => {
    if (!railRef.current) return;
    const cardWidth = 352;
    railRef.current.scrollBy({
      left: direction === "right" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section id="noticias" data-scroll-section="true" className="py-20 bg-background scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-4 text-primary">Noticias recientes</h2>
              <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
                Carousel interno con las ultimas noticias publicadas. Click en una tarjeta para abrir la noticia en modal.
              </p>
            </div>
            <div className="hidden gap-2 md:flex">
              <Button type="button" variant="outline" size="icon" onClick={() => scrollRail("left")} aria-label="Noticias anteriores">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => scrollRail("right")} aria-label="Siguientes noticias">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            ref={railRef}
            className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
          >
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setActivePost(post)}
                className="group w-[320px] shrink-0 snap-start text-left md:w-[350px]"
              >
                <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-elegant backdrop-blur transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_-20px_hsl(var(--primary)/0.32)]">
                  <div className="relative aspect-[16/11] overflow-hidden bg-muted">
                    <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5" />
                      Destacada
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="inline-flex max-w-full rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        <span className="truncate">{post.category}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="space-y-4 p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                        <CalendarDays className="h-3 w-3" />
                        {post.publishedAt ? format(new Date(post.publishedAt), "dd MMM yyyy") : "Sin fecha"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                        <Tag className="h-3 w-3" />
                        {post.tags.slice(0, 1)[0] || "Publicación"}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-2 min-h-14 text-xl font-semibold leading-snug text-primary">{post.title}</h3>
                      <p className="min-h-20 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    </div>
                    <span className="inline-flex text-sm font-medium text-primary underline-offset-4 group-hover:underline">
                      Abrir noticia
                    </span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={Boolean(activePost)} onOpenChange={(open) => !open && setActivePost(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
          {activePost ? (
            <div className="max-h-[90vh] overflow-y-auto p-6 md:p-8">
              <DialogHeader className="mb-6 text-left">
                <DialogTitle className="text-2xl text-primary md:text-3xl">{activePost.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl bg-muted shadow-sm">
                  <img src={activePost.coverImage} alt={activePost.title} className="h-[280px] w-full object-cover md:h-[360px]" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                    <Tag className="h-3.5 w-3.5" />
                    {activePost.category}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {activePost.publishedAt ? format(new Date(activePost.publishedAt), "dd MMMM yyyy") : "Sin fecha"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-foreground">
                    {activePost.tags.length} etiquetas
                  </span>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground">{activePost.excerpt}</p>
                <div className="space-y-4 text-base leading-8 text-foreground">
                  {activePost.content.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {activePost.tags.length ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {activePost.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default NewsCarouselSection;

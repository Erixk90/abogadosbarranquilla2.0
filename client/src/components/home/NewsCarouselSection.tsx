import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Tag, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useCms } from "@/context/CmsContext";
import type { CmsPost } from "@/lib/cms";

const SLIDE_MS = 10000;
const PER_SLIDE = 2;

const NewsCarouselSection = () => {
  const { publishedPosts } = useCms();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activePost, setActivePost] = useState<CmsPost | null>(null);

  const chunks = useMemo(() => {
    const out: CmsPost[][] = [];
    for (let i = 0; i < publishedPosts.length; i += PER_SLIDE) {
      out.push(publishedPosts.slice(i, i + PER_SLIDE));
    }
    return out;
  }, [publishedPosts]);

  const goTo = useCallback((index: number) => setActiveIndex(index), []);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % Math.max(chunks.length, 1));
  }, [chunks.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + chunks.length) % Math.max(chunks.length, 1));
  }, [chunks.length]);

  useEffect(() => {
    if (isPaused || chunks.length <= 1) return;
    const timer = window.setInterval(goNext, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, goNext, chunks.length]);

  return (
    <section
      id="noticias"
      data-scroll-section="true"
      className="relative bg-background py-20 scroll-mt-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-primary">Noticias recientes</h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Las ultimas noticias publicadas. Cada slide rota automaticamente; haz clic en una tarjeta para abrir la noticia completa.
            </p>
          </div>

          <div className="relative">
            {chunks.length > 0 ? (
              <div key={activeIndex} className="slide-content-in">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {chunks[activeIndex].map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => setActivePost(post)}
                      className="group block w-full text-left"
                    >
                      <Card className="h-full overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-elegant backdrop-blur transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_-20px_hsl(var(--primary)/0.32)]">
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
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
                        <CardContent className="space-y-4 p-6">
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
                            <h3 className="mb-2 text-xl font-semibold leading-snug text-primary">{post.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                          </div>
                          <span className="inline-flex text-sm font-medium text-primary underline-offset-4 group-hover:underline">
                            Leer noticia
                          </span>
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-16 text-center text-lg text-muted-foreground">
                Proximamente publicaremos nuevas noticias.
              </p>
            )}

            {chunks.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Grupo de noticias anterior"
                  className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 p-3 text-primary shadow-elegant backdrop-blur transition-all duration-300 hover:bg-muted md:flex"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Siguiente grupo de noticias"
                  className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 p-3 text-primary shadow-elegant backdrop-blur transition-all duration-300 hover:bg-muted md:flex"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <div className="mt-8 flex w-fit items-center gap-2 rounded-full bg-muted/70 px-4 py-2">
                  {chunks.map((_chunk, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`Ir al grupo de noticias ${index + 1}`}
                      aria-current={activeIndex === index}
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        activeIndex === index ? "w-8 bg-primary" : "w-2.5 bg-border hover:bg-primary/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}
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

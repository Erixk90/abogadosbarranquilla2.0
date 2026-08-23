import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import heroImage from "@/assets/hero-law-firm.jpg";
import { useCms } from "@/context/CmsContext";
import type { CmsPost } from "@/lib/cms";

const SLIDE_MS = 10000;

type SlideItem = "hero" | CmsPost;

const HeroSection = () => {
  const { settings, featuredPosts } = useCms();
  const { hero } = settings;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activePost, setActivePost] = useState<CmsPost | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const whatsappNumber = hero.whatsappNumber || "573001477860";
  const backgroundImage = hero.image || heroImage;

  const slides = useMemo<SlideItem[]>(() => ["hero", ...featuredPosts], [featuredPosts]);

  const current = slides[activeIndex];
  const isHero = current === "hero";
  const post = isHero ? null : (current as CmsPost);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = window.setInterval(goNext, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, goNext, slides.length]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (activeIndex === 0) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [activeIndex]);

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(
      hero.whatsappMessage || "Hola, me gustaría solicitar una consulta legal gratuita. ¿Podrían ayudarme?"
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  return (
    <section
      id="inicio"
      data-scroll-section="true"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Contenido destacado"
      className="relative min-h-screen overflow-hidden scroll-mt-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* ===== Slide 1: Hero (video/imagen + mensaje) ===== */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isHero ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        role="group"
        aria-roledescription="slide"
        aria-label="Presentación"
        aria-hidden={!isHero}
      >
        <div className={`absolute inset-0 overflow-hidden ${isHero ? "kenburns" : ""}`}>
          {hero.video ? (
            <video
              ref={videoRef}
              src={hero.video}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster={backgroundImage}
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backgroundImage})` }}
              role="img"
              aria-label="Bufete de abogados en Barranquilla"
            />
          )}
        </div>
        <div className="absolute inset-0 gradient-primary opacity-75"></div>

        <div className="relative z-10 flex min-h-screen items-center">
          <div className="container mx-auto px-4">
             <div className={`mx-auto max-w-4xl text-center text-primary-foreground ${isHero ? "slide-content-in" : ""}`}>
              <h1 className="mb-6 leading-tight">
                {hero.title}
                <span className="block text-accent">{hero.highlight}</span>
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed opacity-90 md:text-2xl">
                {hero.subtitle}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={openWhatsApp}
                  className="text-lg px-8 py-4 shadow-elegant hover:shadow-professional transition-all duration-300"
                >
                  <img src="/whatsapp2.png" alt="WhatsApp" className="h-6 w-6 object-contain" />
                  Consulta Express
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Slides de noticias destacadas (una por slide) ===== */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          !isHero ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        role="group"
        aria-roledescription="slide"
        aria-label="Noticia destacada"
        aria-hidden={isHero}
      >
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }} role="img" aria-label="Bufete de abogados en Barranquilla" />
        <div className="absolute inset-0 gradient-primary opacity-75" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl" />

        <div className="relative z-10 flex min-h-screen items-center">
          <div className="container mx-auto px-4">
            <div className={`mx-auto max-w-[60rem] ${!isHero ? "slide-content-in" : ""}`}>
              <div className="mb-8 text-center text-primary-foreground">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-accent">Actualidad</p>
                <h2 className="mb-3">Noticias recientes</h2>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed opacity-80">
                  Los últimos acontecimientos del ámbito jurídico y de nuestro despacho.
                </p>
              </div>

              {post ? (
                <button
                  type="button"
                  onClick={() => setActivePost(post)}
                  className="group mx-auto block w-full text-left"
                >
                  <Card className="h-full overflow-hidden rounded-3xl border border-white/15 bg-white/10 text-primary-foreground shadow-elegant backdrop-blur transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white/15 group-hover:shadow-[0_24px_60px_-20px_hsl(var(--accent)/0.4)]">
                    <div className="relative aspect-[16/9] overflow-hidden bg-black/30">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full gradient-primary" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                        {post.category}
                      </span>
                    </div>
                    <CardContent className="space-y-3 p-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {post.publishedAt ? format(new Date(post.publishedAt), "dd MMM yyyy") : "Sin fecha"}
                      </span>
                      <h3 className="min-h-14 text-xl font-semibold leading-snug text-primary-foreground">
                        {post.title}
                      </h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-primary-foreground/75">{post.excerpt}</p>
                      <span className="inline-block text-sm font-medium text-accent underline-offset-4 group-hover:underline">
                        Leer noticia
                      </span>
                    </CardContent>
                  </Card>
                </button>
              ) : (
                <p className="text-center text-lg text-primary-foreground/80">
                  Próximamente publicaremos nuevas noticias.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Controles ===== */}
      <div className="absolute inset-x-0 bottom-10 z-20">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-black/25 px-4 py-2 backdrop-blur">
          {slides.map((_slide, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir a la diapositiva ${index + 1}`}
              aria-current={activeIndex === index}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                activeIndex === index ? "w-8 bg-accent" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={goPrev}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 p-3 text-white backdrop-blur transition-all duration-300 hover:bg-black/50 hover:shadow-elegant md:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Siguiente slide"
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 p-3 text-white backdrop-blur transition-all duration-300 hover:bg-black/50 hover:shadow-elegant md:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicador de autoplay */}
      <div
        className={`absolute bottom-0 left-0 z-20 h-1 origin-left transition-opacity duration-300 ${
          isPaused ? "opacity-0" : "opacity-70"
        }`}
        style={{ backgroundColor: "hsl(var(--accent))" }}
      >
        <div key={activeIndex} className="slide-progress h-full w-full" />
      </div>

      {/* ===== Modal de noticia ===== */}
      <Dialog open={Boolean(activePost)} onOpenChange={(open) => !open && setActivePost(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
          {activePost ? (
            <div className="max-h-[90vh] overflow-y-auto p-6 md:p-8">
              <DialogHeader className="mb-6 text-left">
                <DialogTitle className="text-2xl text-primary md:text-3xl">{activePost.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl bg-muted shadow-sm">
                  {activePost.coverImage ? (
                    <img src={activePost.coverImage} alt={activePost.title} className="h-[280px] w-full object-cover md:h-[360px]" />
                  ) : (
                    <div className="h-[280px] w-full gradient-primary md:h-[360px]" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                    {activePost.category}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {activePost.publishedAt ? format(new Date(activePost.publishedAt), "dd MMMM yyyy") : "Sin fecha"}
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

export default HeroSection;

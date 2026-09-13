import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Check, Copy, Facebook, MessageCircle, Tag, Twitter } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCms } from "@/context/CmsContext";
import { useSEO } from "@/hooks/useSEO";

const SITE_URL = "https://www.abogadosbq.com";

const absoluteUrl = (value: string) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const NewsPost = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { ready, getPostBySlug, settings } = useCms();
  const [copied, setCopied] = useState(false);

  const post = getPostBySlug(slug);
  const shareUrl = `${SITE_URL}/noticias/${slug}`;

  const ogImage = useMemo(() => (post ? absoluteUrl(post.coverImage) : ""), [post]);

  useSEO({
    title: post ? `${post.title} | Abogados Barranquilla` : "Noticia | Abogados Barranquilla",
    description: post?.excerpt || post?.content.slice(0, 155) || "Noticias jurídicas del estudio Abogados BQ en Barranquilla.",
    canonical: shareUrl,
    ogTitle: post?.title,
    ogDescription: post?.excerpt || undefined,
    ogImage: ogImage || undefined,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia el enlace de la noticia:", shareUrl);
    }
  };

  const shareText = post ? `${post.title} - ${shareUrl}` : shareUrl;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post?.title ?? "")}`;

  const whatsappNumber = settings.hero.whatsappNumber || "573001477860";
  const whatsappMessage = encodeURIComponent(
    settings.hero.whatsappMessage || "Hola, me gustaría solicitar una consulta legal gratuita. ¿Podrían ayudarme?"
  );

  if (!ready) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto max-w-3xl px-4 pb-24 pt-32">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-6 aspect-[16/9] w-full animate-pulse rounded-3xl bg-muted" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-primary">Noticia no encontrada</h1>
          <p className="mb-8 text-muted-foreground">
            La noticia que busca no existe o ya no está publicada.
          </p>
          <Button asChild>
            <Link to="/noticias">Ver todas las noticias</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <article className="pt-28 pb-20">
        <div className="container mx-auto max-w-3xl px-4">
          <Link
            to="/noticias"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a noticias
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
              <Tag className="h-3.5 w-3.5" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
              <CalendarDays className="h-4 w-4" />
              {post.publishedAt ? format(new Date(post.publishedAt), "dd MMMM yyyy") : "Sin fecha"}
            </span>
          </div>

          <h1 className="mb-6 text-3xl leading-tight text-primary md:text-4xl">{post.title}</h1>

          {post.coverImage ? (
            <div className="mb-8 overflow-hidden rounded-3xl bg-muted shadow-elegant">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-auto max-h-[520px] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="mb-8 flex flex-wrap items-center gap-3 border-y border-border py-4">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              Compartir
            </span>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartir en WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href={facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartir en Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white transition-transform hover:scale-105"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={twitterHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartir en X"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Enlace copiado" : "Copiar enlace"}
            </button>
          </div>

          {post.excerpt ? (
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          ) : null}

          <div className="space-y-5 text-base leading-8 text-foreground">
            {post.content.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {post.tags.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-12 rounded-3xl bg-primary p-8 text-center text-primary-foreground">
            <h2 className="mb-3">¿Necesita asesoría legal?</h2>
            <p className="mb-6 opacity-90">
              Consulta gratuita con nuestro equipo de abogados en Barranquilla.
            </p>
            <Button asChild variant="secondary" size="lg">
              <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                Consulta por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default NewsPost;

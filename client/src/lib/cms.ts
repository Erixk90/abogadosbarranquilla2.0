export type PostStatus = "draft" | "published" | "archived";

export type CmsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: PostStatus;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CmsMediaAsset = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string;
  uploadedAt: string;
};

export type HomeIconKey =
  | "scale"
  | "users"
  | "award"
  | "clock"
  | "car"
  | "shield"
  | "wine"
  | "building"
  | "file-text"
  | "home"
  | "briefcase"
  | "gavel"
  | "landmark"
  | "heart-handshake";

export type HomeStat = {
  icon: HomeIconKey;
  value: string;
  label: string;
};

export type HomeSchedule = {
  days: string;
  hours: string;
};

export type CmsSettings = {
  hero: {
    title: string;
    highlight: string;
    subtitle: string;
    image: string;
    video: string;
    whatsappNumber: string;
    whatsappMessage: string;
  };
  about: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    storyTitle: string;
    story: string[];
    missionTitle: string;
    mission: string;
    stats: HomeStat[];
  };
  contact: {
    title: string;
    description: string;
    whatsappNumber: string;
    whatsappMessage: string;
    phoneLabel: string;
    phone: string;
    email: string;
    address: string;
    addressLink: string;
    hoursLabel: string;
    hours: string;
    schedule: HomeSchedule[];
    emergencyNote: string;
  };
};

export type CmsService = {
  id: string;
  title: string;
  description: string;
  icon: HomeIconKey;
  order: number;
  active: boolean;
  updatedAt: string;
};

export type CmsState = {
  posts: CmsPost[];
  media: CmsMediaAsset[];
  settings: CmsSettings;
  services: CmsService[];
};

const now = () => new Date().toISOString();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const makeSlug = (title: string, existingSlugs: string[], fallbackId?: string) => {
  const base = slugify(title) || "noticia";
  let candidate = base;
  let suffix = 2;

  while (existingSlugs.includes(candidate) && candidate !== fallbackId) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

export const defaultHomeSettings: CmsSettings = {
  hero: {
    title: "Excelencia Jurídica",
    highlight: "a Su Servicio",
    subtitle:
      "Con más de 20 años de experiencia, brindamos asesoría legal integral con la máxima profesionalidad y dedicación personalizada para cada cliente.",
    image: "",
    video: "",
    whatsappNumber: "573001477860",
    whatsappMessage: "Hola, me gustaría solicitar una consulta legal gratuita. ¿Podrían ayudarme?",
  },
  about: {
    title: "Nosotros",
    description:
      "Somos un estudio jurídico comprometido con la excelencia, la integridad y la obtención de resultados excepcionales para nuestros clientes.",
    image: "",
    imageAlt: "Equipo profesional del estudio jurídico",
    storyTitle: "Nuestra Historia",
    story: [
      "Fundado en 2003, nuestro estudio jurídico ha crecido hasta convertirse en una de las firmas legales más respetadas y confiables de la región.",
      "Nuestro equipo de abogados altamente calificados se especializa en diversas áreas del derecho, garantizando una representación integral y especializada para cada caso.",
      "Creemos firmemente en la importancia de construir relaciones duraderas con nuestros clientes, basadas en la confianza, la transparencia y resultados excepcionales.",
    ],
    missionTitle: "Nuestra Misión",
    mission:
      "Proporcionar servicios legales de la más alta calidad, combinando experiencia, innovación y un compromiso inquebrantable con la justicia. Trabajamos incansablemente para proteger los derechos e intereses de nuestros clientes, siempre con integridad y profesionalismo.",
    stats: [
      { icon: "scale", value: "1000+", label: "Casos Exitosos" },
      { icon: "users", value: "20+", label: "Años de Experiencia" },
      { icon: "award", value: "95%", label: "Casos Ganados" },
      { icon: "clock", value: "24/7", label: "Atención al Cliente" },
    ],
  },
  contact: {
    title: "Contacto",
    description:
      "Estamos aquí para ayudarle. Contáctenos para una consulta inicial gratuita y personalizada.",
    whatsappNumber: "573001477860",
    whatsappMessage: "Hola, me gustaría solicitar información sobre sus servicios legales",
    phoneLabel: "WhatsApp",
    phone: "+57 3001477860",
    email: "director@abogadosbq.com",
    address: "080001 Barranquilla",
    addressLink: "https://maps.google.com",
    hoursLabel: "Horario",
    hours: "Lunes a Domingo: 00:00 - 24:00",
    schedule: [
      { days: "Lunes - Viernes:", hours: "00:00 - 24:00" },
      { days: "Sábados:", hours: "00:00 - 24:00" },
      { days: "Domingos:", hours: "00:00 - 24:00" },
    ],
    emergencyNote: "* Consultas de emergencia disponibles 24/7",
  },
};

export const defaultHomeServices: CmsService[] = [
  {
    id: "service-admin",
    title: "Derecho Administrativo",
    description:
      "Representación administrativa en recursos, gestión de contratos públicos y Consultoría en cumplimiento normativo.",
    icon: "users",
    order: 1,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
  {
    id: "service-transito",
    title: "Accidentes De Tránsito",
    description:
      "Accidentes de tránsito, reclamación por daños materiales, corporales, contractual y extracontractual.",
    icon: "car",
    order: 2,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
  {
    id: "service-penal",
    title: "Derecho Penal",
    description: "Defensa penal, representación en juicios criminales y asesoramiento en materia penal.",
    icon: "shield",
    order: 3,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
  {
    id: "service-alcoholemia",
    title: "Alcoholemia",
    description: "Procesos contravesionales por alcohol y suspensión de licencia.",
    icon: "wine",
    order: 4,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
  {
    id: "service-corporativo",
    title: "Derecho Corporativo",
    description:
      "Asesoramiento integral en constitución de empresas, contratos comerciales, fusiones y adquisiciones.",
    icon: "building",
    order: 5,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
  {
    id: "service-familiar",
    title: "Derecho Familiar",
    description:
      "Divorcios, custodia de menores, adopciones y todo lo relacionado con el ámbito familiar.",
    icon: "heart-handshake",
    order: 6,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
  {
    id: "service-civil",
    title: "Derecho Civil",
    description: "Contratos, procesos declarativos, procesos de pertenencia y litigio civiles en general.",
    icon: "file-text",
    order: 7,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
  {
    id: "service-inmobiliario",
    title: "Derecho Inmobiliario",
    description:
      "Compraventa de propiedades, arrendamientos, hipotecas y resolución de conflictos inmobiliarios.",
    icon: "home",
    order: 8,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
  {
    id: "service-laboral",
    title: "Derecho Laboral",
    description:
      "Defensa de derechos laborales, despidos injustificados, negociación colectiva y conflictos laborales.",
    icon: "briefcase",
    order: 9,
    active: true,
    updatedAt: "2026-07-31T08:00:00.000Z",
  },
];

export const seedCmsState: CmsState = {
  posts: [],
  media: [],
  settings: defaultHomeSettings,
  services: defaultHomeServices,
};

export const emptyCmsState = (): CmsState => ({
  posts: [],
  media: [],
  settings: defaultHomeSettings,
  services: [],
});

export const createPostDraft = (): CmsPost => {
  const timestamp = now();

  return {
    id: uid(),
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "General",
    tags: [],
    status: "draft",
    featured: false,
    publishedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const normalizePost = (post: CmsPost, existingSlugs: string[]) => {
  const timestamp = now();
  const slug = makeSlug(post.slug || post.title, existingSlugs, post.id);

  return {
    ...post,
    slug,
    updatedAt: timestamp,
    publishedAt: post.status === "published" ? post.publishedAt ?? timestamp : null,
    tags: post.tags.filter(Boolean),
  } satisfies CmsPost;
};

export const createServiceDraft = (): CmsService => {
  const timestamp = now();

  return {
    id: uid(),
    title: "",
    description: "",
    icon: "scale",
    order: 1,
    active: true,
    updatedAt: timestamp,
  };
};

export const sortPosts = (posts: CmsPost[]) =>
  [...posts].sort((a, b) => {
    const aTime = new Date(a.publishedAt ?? a.updatedAt).getTime();
    const bTime = new Date(b.publishedAt ?? b.updatedAt).getTime();
    return bTime - aTime;
  });

export const sortServices = (services: CmsService[]) =>
  [...services].sort((a, b) => a.order - b.order || b.updatedAt.localeCompare(a.updatedAt));

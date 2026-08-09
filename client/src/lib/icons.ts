import {
  Award,
  Briefcase,
  Building,
  Car,
  Clock,
  FileText,
  Gavel,
  HeartHandshake,
  Home,
  Landmark,
  Scale,
  Shield,
  Users,
  WineOff,
} from "lucide-react";
import type { HomeIconKey } from "@/lib/cms";

export const homeIconConfig: Record<HomeIconKey, { label: string; icon: typeof Scale }> = {
  scale: { label: "Balanza", icon: Scale },
  users: { label: "Personas", icon: Users },
  award: { label: "Premio", icon: Award },
  clock: { label: "Reloj", icon: Clock },
  car: { label: "Auto", icon: Car },
  shield: { label: "Escudo", icon: Shield },
  wine: { label: "Copa", icon: WineOff },
  building: { label: "Edificio", icon: Building },
  "file-text": { label: "Documento", icon: FileText },
  home: { label: "Casa", icon: Home },
  briefcase: { label: "Maletín", icon: Briefcase },
  gavel: { label: "Mazo", icon: Gavel },
  landmark: { label: "Tribunal", icon: Landmark },
  "heart-handshake": { label: "Familia", icon: HeartHandshake },
};

export const homeIconKeys = Object.keys(homeIconConfig) as HomeIconKey[];

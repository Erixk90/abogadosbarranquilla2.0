import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { useCms } from "@/context/CmsContext";
import type { CmsSettings, HomeIconKey, HomeSchedule, HomeStat } from "@/lib/cms";
import { homeIconConfig, homeIconKeys } from "@/lib/icons";

const AdminHome = () => {
  const { settings, saveSettings } = useCms();
  const [form, setForm] = useState<CmsSettings>(() => settings);

  const updateHero = <K extends keyof CmsSettings["hero"]>(key: K, value: CmsSettings["hero"][K]) => {
    setForm((current) => ({ ...current, hero: { ...current.hero, [key]: value } }));
  };

  const updateAbout = <K extends keyof CmsSettings["about"]>(key: K, value: CmsSettings["about"][K]) => {
    setForm((current) => ({ ...current, about: { ...current.about, [key]: value } }));
  };

  const updateContact = <K extends keyof CmsSettings["contact"]>(key: K, value: CmsSettings["contact"][K]) => {
    setForm((current) => ({ ...current, contact: { ...current.contact, [key]: value } }));
  };

  const updateStat = (index: number, field: keyof HomeStat, value: string) => {
    setForm((current) => ({
      ...current,
      about: {
        ...current.about,
        stats: current.about.stats.map((stat, i) => (i === index ? { ...stat, [field]: value } : stat)),
      },
    }));
  };

  const updateSchedule = (index: number, field: keyof HomeSchedule, value: string) => {
    setForm((current) => ({
      ...current,
      contact: {
        ...current.contact,
        schedule: current.contact.schedule.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      },
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveSettings(form);
    toast.success("Contenido de la home guardado");
  };

  const statIconOptions = homeIconKeys.map((key) => ({ key, label: homeIconConfig[key].label }));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-primary">Contenido de la home</h1>
            <p className="mt-2 text-muted-foreground">
              Edita los textos e imágenes de las secciones Hero, Nosotros y Contacto.
            </p>
          </div>

          <Card className="shadow-professional">
            <CardHeader>
              <CardTitle className="text-primary">Hero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Título</Label>
                  <Input id="hero-title" value={form.hero.title} onChange={(event) => updateHero("title", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-highlight">Título destacado</Label>
                  <Input id="hero-highlight" value={form.hero.highlight} onChange={(event) => updateHero("highlight", event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtítulo</Label>
                <Textarea id="hero-subtitle" value={form.hero.subtitle} onChange={(event) => updateHero("subtitle", event.target.value)} />
              </div>
              <MediaUploadField
                id="hero-image"
                label="Imagen de fondo"
                value={form.hero.image}
                onChange={(value) => updateHero("image", value)}
              />
              <div className="space-y-2">
                <Label htmlFor="hero-video">Video de fondo (URL)</Label>
                <Input
                  id="hero-video"
                  value={form.hero.video}
                  onChange={(event) => updateHero("video", event.target.value)}
                  placeholder="https://ejemplo.com/video.mp4"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional: si se define, se reproduce en el primer slide del carrusel en lugar de la imagen.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero-whatsapp">Número WhatsApp</Label>
                  <Input id="hero-whatsapp" value={form.hero.whatsappNumber} onChange={(event) => updateHero("whatsappNumber", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-message">Mensaje de WhatsApp</Label>
                  <Input id="hero-message" value={form.hero.whatsappMessage} onChange={(event) => updateHero("whatsappMessage", event.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-professional">
            <CardHeader>
              <CardTitle className="text-primary">Nosotros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="about-title">Título</Label>
                  <Input id="about-title" value={form.about.title} onChange={(event) => updateAbout("title", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-story-title">Título de la historia</Label>
                  <Input id="about-story-title" value={form.about.storyTitle} onChange={(event) => updateAbout("storyTitle", event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-description">Descripción</Label>
                <Textarea id="about-description" value={form.about.description} onChange={(event) => updateAbout("description", event.target.value)} />
              </div>
              <MediaUploadField
                id="about-image"
                label="Imagen del estudio"
                value={form.about.image}
                onChange={(value) => updateAbout("image", value)}
              />
              <div className="space-y-2">
                <Label htmlFor="about-image-alt">Texto alternativo de la imagen</Label>
                <Input id="about-image-alt" value={form.about.imageAlt} onChange={(event) => updateAbout("imageAlt", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-story">Historia (separar párrafos con una línea en blanco)</Label>
                <Textarea
                  id="about-story"
                  className="min-h-40"
                  value={form.about.story.join("\n\n")}
                  onChange={(event) => updateAbout("story", event.target.value.split(/\n\s*\n/))}
                />
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-primary">Estadísticas</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {form.about.stats.map((stat, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-[100px_1fr_1fr]">
                      <div className="space-y-1">
                        <Label className="text-xs">Icono</Label>
                        <select
                          value={stat.icon}
                          onChange={(event) => updateStat(index, "icon", event.target.value as HomeIconKey)}
                          className="h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                        >
                          {statIconOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Valor</Label>
                        <Input className="h-9" value={stat.value} onChange={(event) => updateStat(index, "value", event.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Etiqueta</Label>
                        <Input className="h-9" value={stat.label} onChange={(event) => updateStat(index, "label", event.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="about-mission-title">Título de la misión</Label>
                  <Input id="about-mission-title" value={form.about.missionTitle} onChange={(event) => updateAbout("missionTitle", event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-mission">Misión</Label>
                <Textarea id="about-mission" value={form.about.mission} onChange={(event) => updateAbout("mission", event.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-professional">
            <CardHeader>
              <CardTitle className="text-primary">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-title">Título</Label>
                  <Input id="contact-title" value={form.contact.title} onChange={(event) => updateContact("title", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-whatsapp">Número WhatsApp</Label>
                  <Input id="contact-whatsapp" value={form.contact.whatsappNumber} onChange={(event) => updateContact("whatsappNumber", event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-description">Descripción</Label>
                <Textarea id="contact-description" value={form.contact.description} onChange={(event) => updateContact("description", event.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone-label">Etiqueta del teléfono</Label>
                  <Input id="contact-phone-label" value={form.contact.phoneLabel} onChange={(event) => updateContact("phoneLabel", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Teléfono</Label>
                  <Input id="contact-phone" value={form.contact.phone} onChange={(event) => updateContact("phone", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-whatsapp-message">Mensaje de WhatsApp</Label>
                  <Input id="contact-whatsapp-message" value={form.contact.whatsappMessage} onChange={(event) => updateContact("whatsappMessage", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" value={form.contact.email} onChange={(event) => updateContact("email", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-address">Dirección</Label>
                  <Input id="contact-address" value={form.contact.address} onChange={(event) => updateContact("address", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-address-link">Enlace del mapa</Label>
                  <Input id="contact-address-link" value={form.contact.addressLink} onChange={(event) => updateContact("addressLink", event.target.value)} />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-primary">Horarios</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {form.contact.schedule.map((row, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Días</Label>
                        <Input className="h-9" value={row.days} onChange={(event) => updateSchedule(index, "days", event.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Horas</Label>
                        <Input className="h-9" value={row.hours} onChange={(event) => updateSchedule(index, "hours", event.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="contact-hours">Horario resumido</Label>
                  <Input id="contact-hours" value={form.contact.hours} onChange={(event) => updateContact("hours", event.target.value)} />
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="contact-emergency">Nota de emergencias</Label>
                  <Input id="contact-emergency" value={form.contact.emergencyNote} onChange={(event) => updateContact("emergencyNote", event.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Guardar contenido</Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminHome;

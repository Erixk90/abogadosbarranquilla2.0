import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCms } from "@/context/CmsContext";
import type { CmsService, HomeIconKey } from "@/lib/cms";
import { homeIconConfig, homeIconKeys } from "@/lib/icons";

const AdminServices = () => {
  const { services, draftService, saveService, deleteService } = useCms();
  const [form, setForm] = useState<CmsService>(() => draftService());
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingService = editingId ? services.find((service) => service.id === editingId) : undefined;

  const resetForm = () => {
    setForm({ ...draftService(), order: services.length + 1 });
    setEditingId(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveService(form);
    resetForm();
  };

  const handleEdit = (service: CmsService) => {
    setForm(service);
    setEditingId(service.id);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-primary">Servicios</h1>
            <p className="mt-2 text-muted-foreground">Gestiona los servicios legales que se muestran en la home.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <Card className="shadow-professional">
              <CardHeader>
                <CardTitle className="text-primary">
                  {editingService ? "Editando servicio" : "Nuevo servicio"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingService ? (
                  <p className="mb-4 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                    Editando: <strong>{editingService.title}</strong>
                  </p>
                ) : null}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icono</Label>
                    <select
                      id="icon"
                      value={form.icon}
                      onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value as HomeIconKey }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {homeIconKeys.map((key) => (
                        <option key={key} value={key}>
                          {homeIconConfig[key].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="order">Orden</Label>
                      <Input id="order" type="number" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: Number(event.target.value) }))} />
                    </div>
                    <label className="flex items-center gap-2 pt-8">
                      <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
                      Activo
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" className="flex-1">
                      {editingService ? "Guardar cambios" : "Guardar servicio"}
                    </Button>
                    {editingService ? (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar edición
                      </Button>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {services.map((service) => {
                const Icon = homeIconConfig[service.icon]?.icon ?? homeIconConfig.scale.icon;

                return (
                  <Card key={service.id} className="shadow-professional">
                    <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
                      <div className="flex gap-3">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-primary">{service.title}</h2>
                          <p className="max-w-md text-sm text-muted-foreground">{service.description}</p>
                          <div className="mt-1 flex flex-wrap gap-3 text-sm">
                            <span>{service.active ? "Activo" : "Inactivo"}</span>
                            <span>Orden {service.order}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => handleEdit(service)}>
                          Editar
                        </Button>
                        <Button variant="destructive" onClick={() => deleteService(service.id)}>
                          Borrar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminServices;

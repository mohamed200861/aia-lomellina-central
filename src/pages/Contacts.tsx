import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, MessageCircle, Send } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const schema = z.object({
  name: z.string().trim().min(2, "Nome obbligatorio").max(100),
  email: z.string().trim().email("Email non valida").max(255),
  subject: z.string().trim().min(2, "Oggetto obbligatorio").max(200),
  message: z.string().trim().min(10, "Messaggio troppo corto").max(2000),
});

type FormData = z.infer<typeof schema>;

export default function Contacts() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });
  const { data: settings } = useSiteSettings();

  async function onSubmit(data: FormData) {
    const { error } = await supabase.from("contact_submissions").insert([{
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    }]);
    if (error) { toast.error("Errore nell'invio. Riprova."); return; }
    toast.success("Messaggio inviato! Ti risponderemo il prima possibile.");
    form.reset();
  }

  const address = settings?.address || "Via Don A. Ceriotti 19, 27029 Vigevano (PV), Italy";
  const phone1 = settings?.phone1 || "+39 0381 327014";
  const phone2 = settings?.phone2 || "+39 373 7832227";
  const email = settings?.email || "lomellina@aia-figc.it";
  const whatsapp = settings?.whatsapp || "+39 373 7832227";

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Contatti
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">Scrivici o vieni a trovarci in sede</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div><h3 className="font-heading font-bold text-sm">Indirizzo</h3><p className="text-sm text-muted-foreground">{address}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-sm">Telefono</h3>
                  <a href={`tel:${phone1.replace(/\s/g, "")}`} className="text-sm text-muted-foreground hover:text-primary block">{phone1}</a>
                  <a href={`tel:${phone2.replace(/\s/g, "")}`} className="text-sm text-muted-foreground hover:text-primary block">{phone2}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div><h3 className="font-heading font-bold text-sm">Email</h3><a href={`mailto:${email}`} className="text-sm text-muted-foreground hover:text-primary">{email}</a></div>
              </div>
              <div className="flex gap-3">
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-pitch text-pitch-foreground rounded-lg text-sm font-medium hover:bg-pitch/90 transition-colors">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a href={settings?.telegram_url || "https://t.me/aialomellina"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Send className="h-4 w-4" /> Telegram
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border mt-6">
                <iframe title="AIA Lomellina" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2806.8!2d8.859!3d45.317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c1c1c1c1c1c1%3A0x0!2sVia+Don+A.+Ceriotti+19%2C+27029+Vigevano+PV!5e0!3m2!1sit!2sit!4v1700000000000" width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-heading font-bold mb-6">Scrivici un Messaggio</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Il tuo nome" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@esempio.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Oggetto</FormLabel><FormControl><Input placeholder="Motivo del contatto" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="message" render={({ field }) => (<FormItem><FormLabel>Messaggio</FormLabel><FormControl><Textarea placeholder="Scrivi qui il tuo messaggio..." rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" size="lg" className="w-full font-bold" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Invio..." : "Invia Messaggio"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, ArrowRight } from "lucide-react";

const schema = z.object({
  first_name: z.string().trim().min(2, "Il nome è obbligatorio").max(50),
  last_name: z.string().trim().min(2, "Il cognome è obbligatorio").max(50),
  email: z.string().trim().email("Email non valida").max(255),
  phone: z.string().trim().min(8, "Numero non valido").max(20),
  birth_date: z.string().min(1, "Data di nascita obbligatoria"),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

export default function BecomeReferee() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: "", last_name: "", email: "", phone: "", birth_date: "", notes: "" },
  });

  async function onSubmit(data: FormData) {
    const { error } = await supabase.from("course_registrations").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      birth_date: data.birth_date,
      notes: data.notes || null,
    });
    if (error) { toast.error("Errore nell'invio. Riprova."); return; }
    toast.success(`Grazie ${data.first_name}, iscrizione inviata! Ti contatteremo presto.`);
    form.reset();
  }

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Diventa Arbitro
          </motion.h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">Inizia il tuo percorso nel mondo arbitrale. Compila il modulo e ti contatteremo.</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-heading font-bold">Perché iscriversi?</h2>
              {["Corso completamente gratuito", "Formatori qualificati e certificati", "Kit arbitrale incluso", "Rimborso spese per ogni gara", "Comunità e amicizia", "Crescita personale garantita"].map((b) => (
                <div key={b} className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-pitch shrink-0 mt-0.5" /><span className="text-foreground/80">{b}</span></div>
              ))}
              <div className="bg-accent rounded-xl p-6 mt-8">
                <h3 className="font-heading font-bold mb-2">Info Rapida</h3>
                <p className="text-sm text-muted-foreground">Età: 14-40 anni</p>
                <p className="text-sm text-muted-foreground">Durata corso: ~3 mesi</p>
                <p className="text-sm text-muted-foreground">Frequenza: 2 sere/settimana</p>
                <p className="text-sm text-muted-foreground">Costo: Gratuito</p>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-heading font-bold mb-6">Modulo di Iscrizione</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Mario" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Cognome</FormLabel><FormControl><Input placeholder="Rossi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="mario@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefono</FormLabel><FormControl><Input type="tel" placeholder="+39 333 1234567" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="birth_date" render={({ field }) => (<FormItem><FormLabel>Data di Nascita</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Note (facoltative)</FormLabel><FormControl><Textarea placeholder="Motivazione, esperienza calcistica..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" size="lg" className="w-full font-bold" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Invio..." : "Invia Iscrizione"} <ArrowRight className="ml-2 h-5 w-5" />
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

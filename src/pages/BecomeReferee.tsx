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
import { toast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(2, "Il nome è obbligatorio").max(50),
  lastName: z.string().min(2, "Il cognome è obbligatorio").max(50),
  email: z.string().email("Email non valida").max(255),
  phone: z.string().min(8, "Numero non valido").max(20),
  birthDate: z.string().min(1, "Data di nascita obbligatoria"),
  city: z.string().min(2, "Città obbligatoria").max(100),
  motivation: z.string().max(1000).optional(),
  experience: z.string().min(1, "Seleziona un'opzione"),
});

type FormData = z.infer<typeof schema>;

export default function BecomeReferee() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", birthDate: "", city: "", motivation: "", experience: "" },
  });

  function onSubmit(data: FormData) {
    toast({ title: "Iscrizione inviata!", description: `Grazie ${data.firstName}, ti contatteremo presto.` });
    form.reset();
  }

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Diventa Arbitro
          </motion.h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Inizia il tuo percorso nel mondo arbitrale. Compila il modulo e ti contatteremo.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Benefits */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-heading font-bold">Perché iscriversi?</h2>
              {[
                "Corso completamente gratuito",
                "Formatori qualificati e certificati",
                "Kit arbitrale incluso",
                "Rimborso spese per ogni gara",
                "Comunità e amicizia",
                "Crescita personale garantita",
              ].map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-pitch shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{b}</span>
                </div>
              ))}
              <div className="bg-accent rounded-xl p-6 mt-8">
                <h3 className="font-heading font-bold mb-2">Info Rapida</h3>
                <p className="text-sm text-muted-foreground">Età: 14-40 anni</p>
                <p className="text-sm text-muted-foreground">Durata corso: ~3 mesi</p>
                <p className="text-sm text-muted-foreground">Frequenza: 2 sere/settimana</p>
                <p className="text-sm text-muted-foreground">Costo: Gratuito</p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-heading font-bold mb-6">Modulo di Iscrizione</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Mario" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Cognome</FormLabel><FormControl><Input placeholder="Rossi" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="mario@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Telefono</FormLabel><FormControl><Input type="tel" placeholder="+39 333 1234567" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="birthDate" render={({ field }) => (
                        <FormItem><FormLabel>Data di Nascita</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>Città di Residenza</FormLabel><FormControl><Input placeholder="Vigevano" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="experience" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Esperienza Calcistica</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nessuna</SelectItem>
                            <SelectItem value="player">Ex Calciatore</SelectItem>
                            <SelectItem value="coach">Allenatore</SelectItem>
                            <SelectItem value="fan">Appassionato</SelectItem>
                            <SelectItem value="other">Altro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="motivation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivazione (facoltativa)</FormLabel>
                        <FormControl><Textarea placeholder="Perché vuoi diventare arbitro?" rows={4} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                      Invia Iscrizione <ArrowRight className="ml-2 h-5 w-5" />
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

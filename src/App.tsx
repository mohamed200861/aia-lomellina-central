import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import Organization from "./pages/Organization";
import RefereesList from "./pages/RefereesList";
import BecomeReferee from "./pages/BecomeReferee";
import MembersArea from "./pages/MembersArea";
import News from "./pages/News";
import Events from "./pages/Events";
import MediaPage from "./pages/MediaPage";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chi-siamo" element={<AboutUs />} />
          <Route path="/organigramma" element={<Organization />} />
          <Route path="/elenco-arbitri" element={<RefereesList />} />
          <Route path="/diventa-arbitro" element={<BecomeReferee />} />
          <Route path="/area-associati" element={<MembersArea />} />
          <Route path="/news" element={<News />} />
          <Route path="/eventi" element={<Events />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/contatti" element={<Contacts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

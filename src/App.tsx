import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import Organization from "./pages/Organization";
import RefereesList from "./pages/RefereesList";
import BecomeReferee from "./pages/BecomeReferee";
import News from "./pages/News";
import Events from "./pages/Events";
import MediaPage from "./pages/MediaPage";
import PressReview from "./pages/PressReview";
import Contacts from "./pages/Contacts";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Members area
import MembersArea from "./pages/MembersArea";
import MembersRTO from "./pages/members/MembersRTO";
import MembersJustify from "./pages/members/MembersJustify";
import MembersReports from "./pages/members/MembersReports";
import MembersReimbursements from "./pages/members/MembersReimbursements";
import MembersMedical from "./pages/members/MembersMedical";
import MembersAthletic from "./pages/members/MembersAthletic";
import MembersDocuments from "./pages/members/MembersDocuments";
import MembersCommunications from "./pages/members/MembersCommunications";

// Admin dashboard
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNews from "./pages/admin/AdminNews";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminRTO from "./pages/admin/AdminRTO";
import AdminReimbursements from "./pages/admin/AdminReimbursements";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPressReview from "./pages/admin/AdminPressReview";
import AdminReferees from "./pages/admin/AdminReferees";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/chi-siamo" element={<AboutUs />} />
            <Route path="/organigramma" element={<Organization />} />
            <Route path="/elenco-arbitri" element={<RefereesList />} />
            <Route path="/diventa-arbitro" element={<BecomeReferee />} />
            <Route path="/news" element={<News />} />
            <Route path="/eventi" element={<Events />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/rassegna-stampa" element={<PressReview />} />
            <Route path="/contatti" element={<Contacts />} />
            <Route path="/login" element={<Auth />} />

            {/* Members Area (protected) */}
            <Route path="/area-associati" element={<ProtectedRoute><MembersArea /></ProtectedRoute>} />
            <Route path="/area-associati/rto" element={<ProtectedRoute><MembersRTO /></ProtectedRoute>} />
            <Route path="/area-associati/giustifica" element={<ProtectedRoute><MembersJustify /></ProtectedRoute>} />
            <Route path="/area-associati/referti" element={<ProtectedRoute><MembersReports /></ProtectedRoute>} />
            <Route path="/area-associati/rimborsi" element={<ProtectedRoute><MembersReimbursements /></ProtectedRoute>} />
            <Route path="/area-associati/medico" element={<ProtectedRoute><MembersMedical /></ProtectedRoute>} />
            <Route path="/area-associati/atletica" element={<ProtectedRoute><MembersAthletic /></ProtectedRoute>} />
            <Route path="/area-associati/documenti" element={<ProtectedRoute><MembersDocuments /></ProtectedRoute>} />
            <Route path="/area-associati/comunicazioni" element={<ProtectedRoute><MembersCommunications /></ProtectedRoute>} />

            {/* Admin Dashboard (protected + admin role) */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/news" element={<ProtectedRoute requireAdmin><AdminNews /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute requireAdmin><AdminEvents /></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute requireAdmin><AdminMedia /></ProtectedRoute>} />
            <Route path="/admin/staff" element={<ProtectedRoute requireAdmin><AdminStaff /></ProtectedRoute>} />
            <Route path="/admin/referees" element={<ProtectedRoute requireAdmin><AdminReferees /></ProtectedRoute>} />
            <Route path="/admin/registrations" element={<ProtectedRoute requireAdmin><AdminRegistrations /></ProtectedRoute>} />
            <Route path="/admin/submissions" element={<ProtectedRoute requireAdmin><AdminSubmissions /></ProtectedRoute>} />
            <Route path="/admin/rto" element={<ProtectedRoute requireAdmin><AdminRTO /></ProtectedRoute>} />
            <Route path="/admin/reimbursements" element={<ProtectedRoute requireAdmin><AdminReimbursements /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/press-review" element={<ProtectedRoute requireAdmin><AdminPressReview /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireSuperAdmin><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

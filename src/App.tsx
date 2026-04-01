import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import ProtectedRoute from "@/components/ProtectedRoute";

// Eager: critical public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// Lazy: public pages
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Organization = lazy(() => import("./pages/Organization"));
const RefereesList = lazy(() => import("./pages/RefereesList"));
const BecomeReferee = lazy(() => import("./pages/BecomeReferee"));
const News = lazy(() => import("./pages/News"));
const Events = lazy(() => import("./pages/Events"));
const MediaPage = lazy(() => import("./pages/MediaPage"));
const PressReview = lazy(() => import("./pages/PressReview"));
const Contacts = lazy(() => import("./pages/Contacts"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Lazy: Members area
const MembersArea = lazy(() => import("./pages/MembersArea"));
const MembersRTO = lazy(() => import("./pages/members/MembersRTO"));
const MembersJustify = lazy(() => import("./pages/members/MembersJustify"));
const MembersReports = lazy(() => import("./pages/members/MembersReports"));
const MembersReimbursements = lazy(() => import("./pages/members/MembersReimbursements"));
const MembersMedical = lazy(() => import("./pages/members/MembersMedical"));
const MembersAthletic = lazy(() => import("./pages/members/MembersAthletic"));
const MembersDocuments = lazy(() => import("./pages/members/MembersDocuments"));
const MembersCommunications = lazy(() => import("./pages/members/MembersCommunications"));

// Lazy: Admin dashboard
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff"));
const AdminRegistrations = lazy(() => import("./pages/admin/AdminRegistrations"));
const AdminSubmissions = lazy(() => import("./pages/admin/AdminSubmissions"));
const AdminRTO = lazy(() => import("./pages/admin/AdminRTO"));
const AdminReimbursements = lazy(() => import("./pages/admin/AdminReimbursements"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminPressReview = lazy(() => import("./pages/admin/AdminPressReview"));
const AdminReferees = lazy(() => import("./pages/admin/AdminReferees"));
const AdminAbsenceJustifications = lazy(() => import("./pages/admin/AdminAbsenceJustifications"));
const AdminMedical = lazy(() => import("./pages/admin/AdminMedical"));
const AdminAthletic = lazy(() => import("./pages/admin/AdminAthletic"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const AdminCommunications = lazy(() => import("./pages/admin/AdminCommunications"));
const AdminActivityLog = lazy(() => import("./pages/admin/AdminActivityLog"));
const AdminEmailSettings = lazy(() => import("./pages/admin/AdminEmailSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,       // 2 min before considered stale
      gcTime: 10 * 60 * 1000,          // 10 min in cache
      refetchOnWindowFocus: false,      // don't refetch on tab switch
      retry: 1,                         // single retry on failure
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  );
}

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimeSync();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RealtimeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Members Area */}
                <Route path="/area-associati" element={<ProtectedRoute><MembersArea /></ProtectedRoute>} />
                <Route path="/area-associati/rto" element={<ProtectedRoute><MembersRTO /></ProtectedRoute>} />
                <Route path="/area-associati/giustifica" element={<ProtectedRoute><MembersJustify /></ProtectedRoute>} />
                <Route path="/area-associati/referti" element={<ProtectedRoute><MembersReports /></ProtectedRoute>} />
                <Route path="/area-associati/rimborsi" element={<ProtectedRoute><MembersReimbursements /></ProtectedRoute>} />
                <Route path="/area-associati/medico" element={<ProtectedRoute><MembersMedical /></ProtectedRoute>} />
                <Route path="/area-associati/atletica" element={<ProtectedRoute><MembersAthletic /></ProtectedRoute>} />
                <Route path="/area-associati/documenti" element={<ProtectedRoute><MembersDocuments /></ProtectedRoute>} />
                <Route path="/area-associati/comunicazioni" element={<ProtectedRoute><MembersCommunications /></ProtectedRoute>} />

                {/* Admin Dashboard */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/news" element={<ProtectedRoute requireAdmin><AdminNews /></ProtectedRoute>} />
                <Route path="/admin/events" element={<ProtectedRoute requireAdmin><AdminEvents /></ProtectedRoute>} />
                <Route path="/admin/media" element={<ProtectedRoute requireAdmin><AdminMedia /></ProtectedRoute>} />
                <Route path="/admin/staff" element={<ProtectedRoute requireAdmin><AdminStaff /></ProtectedRoute>} />
                <Route path="/admin/referees" element={<ProtectedRoute requireAdmin><AdminReferees /></ProtectedRoute>} />
                <Route path="/admin/registrations" element={<ProtectedRoute requireAdmin><AdminRegistrations /></ProtectedRoute>} />
                <Route path="/admin/submissions" element={<ProtectedRoute requireAdmin><AdminSubmissions /></ProtectedRoute>} />
                <Route path="/admin/justifications" element={<ProtectedRoute requireAdmin><AdminAbsenceJustifications /></ProtectedRoute>} />
                <Route path="/admin/rto" element={<ProtectedRoute requireAdmin><AdminRTO /></ProtectedRoute>} />
                <Route path="/admin/reimbursements" element={<ProtectedRoute requireAdmin><AdminReimbursements /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/medical" element={<ProtectedRoute requireAdmin><AdminMedical /></ProtectedRoute>} />
                <Route path="/admin/athletic" element={<ProtectedRoute requireAdmin><AdminAthletic /></ProtectedRoute>} />
                <Route path="/admin/documents" element={<ProtectedRoute requireAdmin><AdminDocuments /></ProtectedRoute>} />
                <Route path="/admin/communications" element={<ProtectedRoute requireAdmin><AdminCommunications /></ProtectedRoute>} />
                <Route path="/admin/press-review" element={<ProtectedRoute requireAdmin><AdminPressReview /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requireSuperAdmin><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/email-settings" element={<ProtectedRoute requireSuperAdmin><AdminEmailSettings /></ProtectedRoute>} />
                <Route path="/admin/activity-log" element={<ProtectedRoute requireAdmin><AdminActivityLog /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </RealtimeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

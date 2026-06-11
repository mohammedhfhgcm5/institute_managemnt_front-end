import { lazy } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { PlatformGuard } from "@/components/platform/PlatformGuard";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ProfilePage = lazy(() => import("@/pages/auth/ProfilePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const StudentsPage = lazy(() => import("@/pages/StudentsPage"));
const StudentDetailPage = lazy(() => import("@/pages/StudentDetailPage"));
const TeachersPage = lazy(() => import("@/pages/TeachersPage"));
const ParentsPage = lazy(() => import("@/pages/ParentsPage"));
const ReceptionPage = lazy(() => import("@/pages/ReceptionPage"));
const CoursesPage = lazy(() => import("@/pages/CoursesPage"));
const SectionsPage = lazy(() => import("@/pages/SectionsPage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const ScheduleBuilderPage = lazy(() => import("@/pages/ScheduleBuilderPage"));
const AssessmentPage = lazy(() => import("@/pages/AssessmentPage"));
const AttendancePage = lazy(() => import("@/pages/AttendancePage"));
const GradesPage = lazy(() => import("@/pages/GradesPage"));
const PaymentsPage = lazy(() => import("@/pages/PaymentsPage"));
const TuitionFeesPage = lazy(() => import("@/pages/TuitionFeesPage"));
const ExpensesPage = lazy(() => import("@/pages/ExpensesPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const PlatformLayout = lazy(() => import("@/app/platform/layout"));
const PlatformLoginPage = lazy(() => import("@/app/platform/login/page"));
const PlatformDashboardPage = lazy(
  () => import("@/app/platform/dashboard/page"),
);
const PlatformOrganizationsPage = lazy(
  () => import("@/app/platform/organizations/page"),
);
const PlatformOrganizationDetailsPage = lazy(
  () => import("@/app/platform/organizations/[id]/page"),
);
const PlatformSubscriptionsPage = lazy(
  () => import("@/app/platform/subscriptions/page"),
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route path="/platform/login" element={<PlatformLoginPage />} />
      <Route
        path="/platform"
        element={
          <PlatformGuard>
            <PlatformLayout />
          </PlatformGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PlatformDashboardPage />} />
        <Route path="organizations" element={<PlatformOrganizationsPage />} />
        <Route
          path="organizations/:id"
          element={<PlatformOrganizationDetailsPage />}
        />
        <Route path="subscriptions" element={<PlatformSubscriptionsPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/parents" element={<ParentsPage />} />
        <Route path="/reception" element={<ReceptionPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/sections" element={<SectionsPage />} />
        <Route path="/schedules" element={<SchedulePage />} />
        <Route path="/schedules/builder" element={<ScheduleBuilderPage />} />
        <Route path="/assessments" element={<AssessmentPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/tuition-fees" element={<TuitionFeesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

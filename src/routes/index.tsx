import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ProfilePage = lazy(() => import("@/pages/auth/ProfilePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const StudentsPage = lazy(() => import("@/pages/StudentsPage"));
const TeachersPage = lazy(() => import("@/pages/TeachersPage"));
const ParentsPage = lazy(() => import("@/pages/ParentsPage"));
const CoursesPage = lazy(() => import("@/pages/CoursesPage"));
const SectionsPage = lazy(() => import("@/pages/SectionsPage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const AssessmentPage = lazy(() => import("@/pages/AssessmentPage"));
const AttendancePage = lazy(() => import("@/pages/AttendancePage"));
const GradesPage = lazy(() => import("@/pages/GradesPage"));
const PaymentsPage = lazy(() => import("@/pages/PaymentsPage"));
const ExpensesPage = lazy(() => import("@/pages/ExpensesPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

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
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/parents" element={<ParentsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/sections" element={<SectionsPage />} />
        <Route path="/schedules" element={<SchedulePage />} />
        <Route path="/assessments" element={<AssessmentPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

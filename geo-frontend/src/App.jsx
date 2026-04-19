import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ScoreDetailPage from './pages/ScoreDetailPage'
import SearchRankPage from './pages/SearchRankPage'
import UserReviewsPage from './pages/UserReviewsPage'
import ReplyManagePage from './pages/ReplyManagePage'
import ChatPage from './pages/ChatPage'
import ContentWorkshopPage from './pages/ContentWorkshopPage'
import ProfilePage from './pages/ProfilePage'

// 非首屏页面懒加载
const StoreInfoPage = lazy(() => import('./pages/StoreInfoPage'))
const PlatformBindPage = lazy(() => import('./pages/PlatformBindPage'))
const DiagnosisHistoryPage = lazy(() => import('./pages/DiagnosisHistoryPage'))
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage'))
const AccountSecurityPage = lazy(() => import('./pages/AccountSecurityPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const TaskCenterPage = lazy(() => import('./pages/TaskCenterPage'))
const NotificationCenterPage = lazy(() => import('./pages/NotificationCenterPage'))

import { useAuth, AuthProvider } from './hooks/useAuth'

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}>
      加载中...
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<HomePage />} />
            <Route path="score" element={<ScoreDetailPage />} />
            <Route path="search-rank" element={<SearchRankPage />} />
            <Route path="reviews" element={<UserReviewsPage />} />
            <Route path="reply" element={<ReplyManagePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="content" element={<ContentWorkshopPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="store-info" element={<StoreInfoPage />} />
            <Route path="platforms" element={<PlatformBindPage />} />
            <Route path="diagnosis-history" element={<DiagnosisHistoryPage />} />
            <Route path="notifications" element={<NotificationCenterPage />} />
            <Route path="notification-settings" element={<NotificationSettingsPage />} />
            <Route path="security" element={<AccountSecurityPage />} />
            <Route path="tasks" element={<TaskCenterPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

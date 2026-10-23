import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useProfile } from './profile'
import Welcome from './pages/Welcome'
import Auth from './pages/Auth'
import Setup from './pages/Setup'
import Home from './pages/Home'
import Train from './pages/Train'
import Exercise from './pages/Exercise'
import Workout from './pages/Workout'
import Stretch from './pages/Stretch'
import CoachPicker from './pages/CoachPicker'
import Done from './pages/Done'
import Meals from './pages/Meals'
import Dish from './pages/Dish'
import Progress from './pages/Progress'
import Health from './pages/Health'
import Challenges from './pages/Challenges'
import Profile from './pages/Profile'

// Hai màn dùng AI tải riêng, để các màn khác mở nhanh hơn
const Coach = lazy(() => import('./pages/Coach'))
const Scan = lazy(() => import('./pages/Scan'))

export default function App() {
  const { profile } = useProfile()
  return (
    <Suspense fallback={<div className="page cam" />}>
      <Routes>
        <Route path="/" element={<Navigate to={profile.onboarded ? '/home' : '/welcome'} replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/train" element={<Train />} />
        <Route path="/exercise/:id" element={<Exercise />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/stretch" element={<Stretch />} />
        <Route path="/coach" element={<CoachPicker />} />
        <Route path="/coach/:id" element={<Coach />} />
        <Route path="/done" element={<Done />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/dish/:id" element={<Dish />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/health" element={<Health />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/profile" element={<Profile />} />
        {/* Đường dẫn của bản trước */}
        <Route path="/today" element={<Navigate to="/home" replace />} />
        <Route path="/plan" element={<Navigate to="/train?tab=week" replace />} />
        <Route path="/library" element={<Navigate to="/train?tab=library" replace />} />
        <Route path="/nutrition" element={<Navigate to="/meals" replace />} />
        <Route path="/after" element={<Navigate to="/done" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'

import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/components/dashboard/Dashboard'

export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* TODO: Add more routes */}
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
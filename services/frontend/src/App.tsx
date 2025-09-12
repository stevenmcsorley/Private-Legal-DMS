import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'

import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { MatterList } from '@/components/matters/MatterList'
import { MatterDetails } from '@/components/matters/MatterDetails'
import { CreateMatter } from '@/components/matters/CreateMatter'
import { ClientList } from '@/components/clients/ClientList'
import { ClientDetails } from '@/components/clients/ClientDetails'
import { CreateClient } from '@/components/clients/CreateClient'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { SearchPage } from '@/components/search/SearchPage'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { ClientPortal } from '@/components/portal/ClientPortal'
import { CrossFirmSharing } from '@/components/sharing/CrossFirmSharing'

export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Matters */}
          <Route path="matters" element={<MatterList />} />
          <Route path="matters/new" element={<CreateMatter />} />
          <Route path="matters/:id" element={<MatterDetails />} />
          
          {/* Clients */}
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/new" element={<CreateClient />} />
          <Route path="clients/:id" element={<ClientDetails />} />
          
          {/* Documents */}
          <Route path="documents" element={<DocumentsPage />} />
          
          {/* Search */}
          <Route path="search" element={<SearchPage />} />
          
          {/* Admin */}
          <Route path="admin" element={<AdminDashboard />} />
          
          {/* Client Portal */}
          <Route path="portal/documents" element={<ClientPortal />} />
          <Route path="portal/matters" element={<ClientPortal />} />
          <Route path="portal/upload" element={<ClientPortal />} />
          
          {/* Cross-Firm Sharing */}
          <Route path="sharing" element={<CrossFirmSharing />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

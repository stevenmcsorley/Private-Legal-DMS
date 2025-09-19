import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'

import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminOnly, LegalStaffOnly, ClientOnly, RoleGuard } from '@/components/auth'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { MatterList } from '@/components/matters/MatterList'
import { MatterDetails } from '@/components/matters/MatterDetails'
import { CreateMatter } from '@/components/matters/CreateMatter'
import { EditMatter } from '@/components/matters/EditMatter'
import { MatterAddMember } from '@/components/matters/MatterAddMember'
import { ClientList } from '@/components/clients/ClientList'
import { ClientDetails } from '@/components/clients/ClientDetails'
import { CreateClient } from '@/components/clients/CreateClient'
import { EditClient } from '@/components/clients/EditClient'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { SearchPage } from '@/components/search/SearchPage'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { ClientPortal } from '@/components/portal/ClientPortal'
import { CrossFirmSharing } from '@/components/sharing/CrossFirmSharing'
import { CreateShare } from '@/components/sharing/CreateShare'
import { SharedDocumentViewer } from '@/components/shares/SharedDocumentViewer'

export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Matters - Legal staff (includes super admin) */}
          <Route path="matters" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to access matters management.</p></div>}>
              <MatterList />
            </LegalStaffOnly>
          } />
          <Route path="matters/new" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to create matters.</p></div>}>
              <CreateMatter />
            </LegalStaffOnly>
          } />
          <Route path="matters/:id" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to view matter details.</p></div>}>
              <MatterDetails />
            </LegalStaffOnly>
          } />
          <Route path="matters/:id/edit" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to edit matters.</p></div>}>
              <EditMatter />
            </LegalStaffOnly>
          } />
          <Route path="matters/:id/add-member" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to add team members.</p></div>}>
              <MatterAddMember />
            </LegalStaffOnly>
          } />
          
          {/* Clients - Legal staff (includes super admin) */}
          <Route path="clients" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to access client management.</p></div>}>
              <ClientList />
            </LegalStaffOnly>
          } />
          <Route path="clients/new" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to create clients.</p></div>}>
              <CreateClient />
            </LegalStaffOnly>
          } />
          <Route path="clients/:id" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to view client details.</p></div>}>
              <ClientDetails />
            </LegalStaffOnly>
          } />
          <Route path="clients/:id/edit" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to edit clients.</p></div>}>
              <EditClient />
            </LegalStaffOnly>
          } />
          
          {/* Documents - Available to legal staff, limited for clients */}
          <Route path="documents" element={<DocumentsPage />} />
          
          {/* Search - Legal staff (includes super admin) */}
          <Route path="search" element={
            <LegalStaffOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to access search functionality.</p></div>}>
              <SearchPage />
            </LegalStaffOnly>
          } />
          
          {/* Admin - Admin only */}
          <Route path="admin/*" element={
            <AdminOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to access admin panel.</p></div>}>
              <AdminDashboard />
            </AdminOnly>
          } />
          
          {/* Client Portal - Client users only */}
          <Route path="portal/documents" element={
            <ClientOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">Client portal access only.</p></div>}>
              <ClientPortal />
            </ClientOnly>
          } />
          <Route path="portal/matters" element={
            <ClientOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">Client portal access only.</p></div>}>
              <ClientPortal />
            </ClientOnly>
          } />
          <Route path="portal/upload" element={
            <ClientOnly fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">Client portal access only.</p></div>}>
              <ClientPortal />
            </ClientOnly>
          } />
          
          {/* Cross-Firm Sharing - Legal staff only */}
          <Route path="sharing" element={
            <RoleGuard roles={['legal_professional', 'legal_manager', 'firm_admin', 'super_admin']} fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to access cross-firm sharing.</p></div>}>
              <CrossFirmSharing />
            </RoleGuard>
          } />
          <Route path="sharing/new" element={
            <RoleGuard roles={['legal_professional', 'legal_manager', 'firm_admin', 'super_admin']} fallback={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="mt-4">You don't have permission to create shares.</p></div>}>
              <CreateShare />
            </RoleGuard>
          } />
          <Route path="sharing/:shareId" element={<SharedDocumentViewer />} />
          <Route path="sharing/:shareId/documents/:documentId" element={<SharedDocumentViewer />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

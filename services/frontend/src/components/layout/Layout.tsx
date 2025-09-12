import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500">
              © 2024 Legal DMS. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
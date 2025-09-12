import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-64 flex min-h-screen flex-col">
        <main className="py-6 flex-1">
          <div className="mx-auto w-full max-w-screen-2xl px-6 lg:px-10">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-slate-800 bg-slate-900">
          <div className="mx-auto w-full max-w-screen-2xl px-6 py-4 lg:px-10">
            <p className="text-sm text-slate-400">
              © 2024 Legal DMS. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

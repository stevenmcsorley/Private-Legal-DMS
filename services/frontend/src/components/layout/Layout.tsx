import { Outlet } from 'react-router-dom'

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Legal DMS</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Legal DMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
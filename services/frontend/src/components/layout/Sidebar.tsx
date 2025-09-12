import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Building,
  Search,
  Settings,
  Shield,
  Share2,
  Archive,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredRoles?: string[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Matters', href: '/matters', icon: Archive },
  { name: 'Clients', href: '/clients', icon: Building },
  { name: 'Search', href: '/search', icon: Search },
  { 
    name: 'Cross-Firm Sharing', 
    href: '/sharing', 
    icon: Share2,
    requiredRoles: ['legal_professional', 'legal_manager', 'firm_admin']
  },
  { 
    name: 'Admin', 
    href: '/admin', 
    icon: Settings,
    requiredRoles: ['firm_admin', 'super_admin']
  },
];

const clientPortalNavigation: NavItem[] = [
  { name: 'My Documents', href: '/portal/documents', icon: FileText },
  { name: 'My Matters', href: '/portal/matters', icon: Archive },
  { name: 'Upload Documents', href: '/portal/upload', icon: FileText },
];

export const Sidebar = () => {
  const { user, logout, hasAnyRole, hasRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isClientUser = hasRole('client_user');
  const navItems = isClientUser ? clientPortalNavigation : navigation;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center space-x-3 px-6 py-6 border-b border-gray-200">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Legal DMS</h1>
          {isClientUser && (
            <p className="text-xs text-gray-500">Client Portal</p>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.display_name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
            {user?.roles && (
              <div className="flex flex-wrap gap-1 mt-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {role.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const canAccess = !item.requiredRoles || hasAnyRole(item.requiredRoles);
          
          if (!canAccess) return null;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileMenu}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-sm border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};
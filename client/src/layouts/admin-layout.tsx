import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell, Mail } from 'lucide-react';
import Sidebar from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  // Get the current page title
  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Dashboard';
      case '/campaigns':
        return 'Campaigns';
      case '/templates':
        return 'Templates';
      case '/target-groups':
        return 'Target Groups';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      default:
        return 'PhishGuard';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 font-sans antialiased text-slate-800">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-6 w-6 text-slate-600" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent"></span>
                </Button>
              </div>
              <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Mail className="h-6 w-6 text-slate-600" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent"></span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

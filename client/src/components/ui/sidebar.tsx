import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Disc3, 
  SendHorizonal, 
  Files, 
  Users, 
  CalendarClock, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    {
      group: "Main",
      items: [
        { 
          name: "Dashboard", 
          path: "/", 
          icon: <Disc3 className="h-5 w-5" /> 
        },
        { 
          name: "Campaigns", 
          path: "/campaigns", 
          icon: <SendHorizonal className="h-5 w-5" /> 
        },
        { 
          name: "Templates", 
          path: "/templates", 
          icon: <Files className="h-5 w-5" /> 
        },
        { 
          name: "Target Groups", 
          path: "/target-groups", 
          icon: <Users className="h-5 w-5" /> 
        },
        { 
          name: "Reports", 
          path: "/reports", 
          icon: <CalendarClock className="h-5 w-5" /> 
        },
      ]
    },
    {
      group: "Settings",
      items: [
        { 
          name: "Settings", 
          path: "/settings", 
          icon: <Settings className="h-5 w-5" /> 
        },
        { 
          name: "Help & Documentation", 
          path: "/help", 
          icon: <HelpCircle className="h-5 w-5" /> 
        },
      ]
    }
  ];

  return (
    <aside className={`bg-secondary text-white w-full md:w-64 md:fixed md:h-full flex-shrink-0 ${className}`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">PhishGuard</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        {navItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="px-4 py-2 text-sm text-slate-400 uppercase font-semibold">
              {group.group}
            </div>
            {group.items.map((item, index) => (
              <Link 
                key={index} 
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 ${
                  isActive(item.path) 
                    ? "bg-blue-900 border-l-4 border-primary" 
                    : "hover:bg-blue-900 transition-colors"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      
      {user && (
        <div className="mt-auto p-4 hidden md:block">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-slate-400">Security Admin</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-4 block text-sm text-slate-400 hover:text-white"
          >
            <span className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

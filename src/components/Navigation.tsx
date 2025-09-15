import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  AlertTriangle,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      badge: '1,523'
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: Car,
      badge: '3,245'
    },
    {
      id: 'policies',
      label: 'Policies',
      icon: FileText,
      badge: '2,847'
    },
    {
      id: 'claims',
      label: 'Claims',
      icon: AlertTriangle,
      badge: '47'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      badge: null
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={toggleMobile}
          size="sm"
          className="bg-primary hover:bg-primary-hover"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-card shadow-elevated z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="p-6 border-b bg-gradient-hero">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">InsuranceMax</h2>
              <p className="text-xs text-white/80">Kenya Insurance Agency</p>
              <br></br>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">James Kiprotich</div>
              <div className="text-xs text-muted-foreground">Senior Agent</div>
            </div>
            <Button size="sm" variant="ghost">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentView === item.id 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-accent"
                }`}
                onClick={() => {
                  onViewChange(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-muted text-muted-foreground text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Spacer for Desktop */}
      <div className="hidden lg:block w-1 flex-shrink-0" />
    </>
  );
};

export default Navigation;
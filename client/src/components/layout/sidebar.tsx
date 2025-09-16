import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  FlaskConical, 
  FileText,
  Activity
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Protocols", href: "/protocols", icon: ClipboardList },
  { name: "Labs", href: "/labs", icon: FlaskConical },
  { name: "Reports", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-card shadow-lg border-r border-border">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">MedTracker</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

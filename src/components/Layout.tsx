import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FolderOpen, 
  BookOpen, 
  UserCheck, 
  Mic, 
  LogOut,
  LayoutDashboard
} from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const adminLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/users", label: "Users", icon: Users },
    { to: "/categories", label: "Categories", icon: FolderOpen },
    { to: "/books", label: "Books", icon: BookOpen },
    { to: "/assignments", label: "Assignments", icon: UserCheck },
  ];

  const speakerLinks = [
    { to: "/", label: "My Books", icon: BookOpen },
  ];

  const links = isAdmin ? adminLinks : speakerLinks;

  const isActive = (path: string) => {
    if (path === "/" && user?.role === "speaker") {
      return location.pathname === "/" || !location.pathname.startsWith("/record");
    }
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">TTS Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">{user?.username}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.to)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

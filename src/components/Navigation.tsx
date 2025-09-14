import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Brain, 
  User, 
  Menu, 
  X,
  Apple,
  LogOut,
  Calendar,
  GraduationCap,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile, isStudent, isTeacher, isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (user && isStudent && !roleLoading) {
      fetchUnreadCount();
    }
  }, [user, isStudent, roleLoading]);

  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .or(`recipient_id.eq.${user!.id},and(is_broadcast.eq.true,recipient_id.is.null)`)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        setUnreadCount(0);
        return;
      }
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Show loading state while role is being determined
  if (roleLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: "Admin Panel", href: "/admin", icon: GraduationCap },
      ];
    } else if (isTeacher) {
      return [
        { name: "Teacher Dashboard", href: "/teacher", icon: GraduationCap },
      ];
    } else if (isStudent) {
      return [
        { name: "Dashboard", href: "/", icon: Home },
        { name: "Nutrition", href: "/nutrition", icon: BarChart3 },
        { name: "AI Suggestions", href: "/ai-suggestions", icon: Brain },
        { name: "Meal Plans", href: "/meal-plans", icon: Calendar },
        { name: "Notifications", href: "/notifications", icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
      ];
    }
    return [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "Nutrition", href: "/nutrition", icon: BarChart3 },
      { name: "AI Suggestions", href: "/ai-suggestions", icon: Brain },
      { name: "Meal Plans", href: "/meal-plans", icon: Calendar },
    ];
  };

  const navItems = getNavItems();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <nav className="bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-green">
                <Apple className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                NutriEdu
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-green"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Auth Button */}
            <Button
              onClick={handleAuthClick}
              variant={user ? "outline" : "default"}
              className="ml-2"
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-up">
          <div className="py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Mobile Auth Button */}
            <button
              onClick={() => {
                handleAuthClick();
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors w-full text-left",
                "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {user ? (
                <>
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </nav>
  );
};

export default Navigation;
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Coffee, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Fetch username when user changes
  useEffect(() => {
    if (user?.id) {
      const fetchUsername = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!error && data) {
          setUsername(data.username);
        }
      };
      
      fetchUsername();
    } else {
      setUsername(null);
    }
  }, [user?.id]);

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { name: "Home", href: "/", icon: Coffee },
    { name: "Discover", href: "/discover", icon: Coffee },
  ];

  const NavLink = ({ href, children, className = "", onClick }: { 
    href: string; 
    children: React.ReactNode; 
    className?: string;
    onClick?: () => void;
  }) => (
    <Link
      to={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        isActive(href) ? "text-primary" : "text-muted-foreground"
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );

  const UserSection = ({ mobile = false }: { mobile?: boolean }) => {
    if (user) {
      return (
        <div className={`flex items-center gap-2 ${mobile ? 'flex-col w-full' : ''}`}>
          <NavLink href="/dashboard" className={mobile ? 'w-full text-left' : ''}>
            My Profiles
          </NavLink>
          <span className={`text-sm text-muted-foreground truncate ${
            mobile ? 'w-full text-left' : 'max-w-32'
          }`}>
            {username || user.email?.split('@')[0]}
          </span>
          {mobile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 justify-start"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigate('/auth');
          if (mobile) setIsOpen(false);
        }}
        className={`flex items-center gap-2 ${mobile ? 'w-full justify-start' : ''}`}
      >
        <User className="h-4 w-4" />
        Sign In
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Coffee className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">Coffee Roast Timer</span>
            <span className="sm:hidden">Roast Timer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <NavLink key={item.name} href={item.href}>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop User Section */}
          <div className="hidden md:flex">
            <UserSection />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
                  <Coffee className="h-6 w-6 text-primary" />
                  Coffee Roast Timer
                </Link>
                
                <nav className="flex flex-col gap-4">
                  {navigationItems.map((item) => (
                    <NavLink 
                      key={item.name} 
                      href={item.href}
                      className="text-base py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </nav>

                <div className="border-t pt-4">
                  <UserSection mobile />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
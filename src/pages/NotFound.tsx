import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-secondary">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 bg-gradient-primary rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-green">
          <span className="text-4xl text-primary-foreground">🔍</span>
        </div>
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! This page doesn't exist</p>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">
          The page you're looking for might have been moved, deleted, or doesn't exist.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 shadow-green font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

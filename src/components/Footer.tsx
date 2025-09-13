import { Heart, Github, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-green">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">NutriEdu</span>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Empowering students and educators with intelligent nutrition tracking and 
              personalized health insights for a healthier future.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              
              <a 
                href="mailto:manavahir902@gmail.com" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />manavahir902@gmail.com
              </a>
              <a 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Phone"
              >
                <Phone className="h-5 w-5" />+919999999999
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/log-meal" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Log Meal
                </Link>
              </li>
              <li>
                <Link 
                  to="/nutrition" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Nutrition Analytics
                </Link>
              </li>
              <li>
                <Link 
                  to="/tips" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Healthy Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © {currentYear} NutriEdu Platform. All rights reserved.
            </div>
            <div className="text-muted-foreground text-sm">
              Built with ❤️ by{" "}
              <span className="text-primary font-medium">Team HexaHack</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
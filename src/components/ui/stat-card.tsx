import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning";
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = "default",
  className 
}: StatCardProps) => {
  const variantStyles = {
    default: "bg-card hover:bg-accent-light/20",
    success: "bg-gradient-to-br from-success/10 to-accent-light/10",
    warning: "bg-gradient-to-br from-warning/10 to-accent-light/10"
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:scale-105 hover:shadow-green border-0 shadow-card animate-fade-in",
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <div className="p-3 bg-gradient-primary rounded-xl shadow-green">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
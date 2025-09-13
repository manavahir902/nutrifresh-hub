import { Utensils, TrendingUp, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-primary text-primary-foreground py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            NutriEdu Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Empowering students with smart nutrition tracking and personalized health insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30 backdrop-blur-sm"
            >
              <Link to="/log-meal">Log Your Meal</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="border-white/30 text-primary-foreground hover:bg-white/10 backdrop-blur-sm"
            >
              <Link to="/nutrition">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Your Nutrition Overview
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your progress and build healthy eating habits with real-time insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Meals Logged"
              value="47"
              subtitle="This month"
              icon={Utensils}
              variant="success"
            />
            <StatCard
              title="Average Calories"
              value="1,850"
              subtitle="Daily intake"
              icon={TrendingUp}
              variant="default"
            />
            <StatCard
              title="Healthy Ratio"
              value="78%"
              subtitle="Healthy vs unhealthy"
              icon={Target}
              variant="success"
            />
            <StatCard
              title="Weekly Goal"
              value="5/7"
              subtitle="Days on track"
              icon={Activity}
              variant="warning"
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-8 rounded-2xl shadow-card hover:shadow-green transition-all duration-300 hover:scale-105 animate-slide-up">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Utensils className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Log New Meal</h3>
              <p className="text-muted-foreground mb-6">
                Record what you ate and track your nutritional intake
              </p>
              <Button asChild className="w-full">
                <Link to="/log-meal">Log Meal</Link>
              </Button>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-card hover:shadow-green transition-all duration-300 hover:scale-105 animate-slide-up">
              <div className="w-16 h-16 bg-gradient-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">View Analytics</h3>
              <p className="text-muted-foreground mb-6">
                Explore detailed charts and nutrition patterns
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/nutrition">View Charts</Link>
              </Button>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-card hover:shadow-green transition-all duration-300 hover:scale-105 animate-slide-up">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Get AI Tips</h3>
              <p className="text-muted-foreground mb-6">
                Receive personalized nutrition recommendations
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/ai-suggestions">Get Tips</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, GraduationCap, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    studentId: "",
    childName: ""
  });

  const handleSubmit = (e: React.FormEvent, userType: string) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Login Successful!",
      description: `Welcome back! Logging in as ${userType}.`,
    });

    // Reset form
    setFormData({
      email: "",
      password: "",
      studentId: "",
      childName: ""
    });
  };

  const userTypes = [
    {
      id: "student",
      name: "Student",
      icon: User,
      description: "Access your personal nutrition dashboard",
      color: "from-primary to-accent"
    },
    {
      id: "parent",
      name: "Parent",
      icon: Users,
      description: "View your child's nutrition reports and progress",
      color: "from-accent to-primary"
    },
    {
      id: "teacher",
      name: "Teacher",
      icon: GraduationCap,
      description: "Monitor class nutrition metrics and student progress",
      color: "from-success to-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-green">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your nutrition platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card border-0 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-center text-xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                {userTypes.map((type) => (
                  <TabsTrigger 
                    key={type.id} 
                    value={type.id}
                    className="flex items-center space-x-1"
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{type.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {userTypes.map((type) => (
                <TabsContent key={type.id} value={type.id} className="space-y-6">
                  {/* User Type Header */}
                  <div className={`bg-gradient-to-r ${type.color} p-4 rounded-xl text-primary-foreground text-center`}>
                    <type.icon className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">{type.name} Portal</h3>
                    <p className="text-sm opacity-90">{type.description}</p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={(e) => handleSubmit(e, type.name)} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>Email Address</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <span>Password</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="focus:ring-primary focus:border-primary pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Additional Fields */}
                    {type.id === "student" && (
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID (Optional)</Label>
                        <Input
                          id="studentId"
                          placeholder="Enter your student ID"
                          value={formData.studentId}
                          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                          className="focus:ring-primary focus:border-primary"
                        />
                      </div>
                    )}

                    {type.id === "parent" && (
                      <div className="space-y-2">
                        <Label htmlFor="childName">Child's Name (Optional)</Label>
                        <Input
                          id="childName"
                          placeholder="Enter your child's name"
                          value={formData.childName}
                          onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                          className="focus:ring-primary focus:border-primary"
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      type="submit"
                      className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 shadow-green text-lg py-6`}
                    >
                      <type.icon className="h-5 w-5 mr-2" />
                      Sign In as {type.name}
                    </Button>
                  </form>

                  {/* Additional Options */}
                  <div className="text-center space-y-2">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Forgot Password?
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Don't have an account? Contact your school administrator
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-card p-4 rounded-xl shadow-card text-center">
            <h3 className="font-medium text-foreground mb-2">🔒 Secure Access</h3>
            <p className="text-sm text-muted-foreground">
              Your data is protected with industry-standard encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
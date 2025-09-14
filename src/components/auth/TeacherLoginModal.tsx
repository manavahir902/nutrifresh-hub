import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, Mail, Lock, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TeacherLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeacherLoginModal({ open, onOpenChange }: TeacherLoginModalProps) {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    teacherCode: ""
  });

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.teacherCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Validating teacher login:', { email: formData.email, teacherCode: formData.teacherCode });
      
      // Step 1: Verify the teacher code exists and is active
      const { data: credentialData, error: credentialError } = await supabase
        .from('teacher_credentials')
        .select('*')
        .eq('teacher_code', formData.teacherCode)
        .eq('is_active', true)
        .single();

      console.log('Credential query result:', { credentialData, credentialError });

      if (credentialError) {
        console.error('Credential error:', credentialError);
        toast({
          title: "Database Error",
          description: `Failed to validate teacher code: ${credentialError.message}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!credentialData) {
        toast({
          title: "Invalid Teacher Code",
          description: "The teacher code you entered is invalid or inactive.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Found credential:', credentialData);

      // Step 2: Get the profile for this teacher
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, role')
        .eq('user_id', credentialData.teacher_id)
        .single();

      console.log('Profile query result:', { profileData, profileError });

      if (profileError) {
        console.error('Profile error:', profileError);
        toast({
          title: "Database Error",
          description: `Failed to get teacher profile: ${profileError.message}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!profileData) {
        toast({
          title: "Profile Not Found",
          description: "No profile found for this teacher code. Please contact your administrator.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Step 3: Validate email and role
      if (profileData.email !== formData.email) {
        toast({
          title: "Email Mismatch",
          description: "The email does not match the teacher account for this code.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (profileData.role !== 'teacher') {
        toast({
          title: "Invalid Role",
          description: "This account is not a teacher account.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('All validations passed, proceeding with login...');

      // Proceed with login
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back, Teacher!",
          description: "You have successfully signed in to your teacher account.",
        });
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      teacherCode: ""
    });
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground flex items-center justify-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Teacher Login</span>
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Access your teacher account with your credentials
          </p>
        </DialogHeader>

        <form onSubmit={handleTeacherLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacher-code" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Teacher Code</span>
            </Label>
            <Input
              id="teacher-code"
              type="text"
              placeholder="Enter your teacher code"
              value={formData.teacherCode}
              onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              This code is provided by your administrator
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email Address</span>
            </Label>
            <Input
              id="teacher-email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-password" className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Password</span>
            </Label>
            <div className="relative">
              <Input
                id="teacher-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In as Teacher"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Don't have a teacher account? Contact your administrator to get one.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}


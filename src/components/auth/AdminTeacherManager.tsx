import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Plus, Eye, EyeOff, Trash2, UserPlus, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config/supabase';

interface TeacherAccount {
  id: string;
  teacher_code: string;
  is_active: boolean;
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

// Service role client for admin operations
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || SUPABASE_CONFIG.serviceRoleKey
);

export function AdminTeacherManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    ageGroup: "21+"
  });

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchTeachers();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      console.log('Fetching teachers...');
      
      // First, get all teacher credentials
      const { data: credentials, error: credentialsError } = await supabase
        .from('teacher_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (credentialsError) {
        console.error('Credentials error:', credentialsError);
        throw credentialsError;
      }

      if (!credentials || credentials.length === 0) {
        setTeachers([]);
        return;
      }

      // Then, get profiles for each teacher
      const teacherIds = credentials.map(c => c.teacher_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', teacherIds);

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        throw profilesError;
      }

      // Combine the data
      const teachersWithProfiles = credentials.map(credential => {
        const profile = profiles?.find(p => p.user_id === credential.teacher_id);
        return {
          id: credential.id,
          teacher_code: credential.teacher_code,
          is_active: credential.is_active,
          created_at: credential.created_at,
          profile: profile ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email
          } : null
        };
      });

      console.log('Teachers with profiles:', teachersWithProfiles);
      setTeachers(teachersWithProfiles);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: `Failed to fetch teacher accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const generateTeacherCode = () => {
    const prefix = "TCH";
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const timestamp = Date.now().toString().slice(-5);
    return `${prefix}${randomNum}${timestamp}`;
  };

  const createTeacherAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in as an admin to create teacher accounts.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create the user account using admin client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          age_group: formData.ageGroup,
          role: 'teacher'
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile using admin client
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            age_group: formData.ageGroup,
            role: 'teacher'
          });

        if (profileError) throw profileError;

        // Generate teacher code
        const teacherCode = generateTeacherCode();

        // Create teacher credentials using admin client
        console.log('Creating teacher credentials:', {
          teacher_id: authData.user.id,
          teacher_code: teacherCode,
          created_by: user!.id
        });
        
        const { data: credentialData, error: credentialError } = await supabaseAdmin
          .from('teacher_credentials')
          .insert({
            teacher_id: authData.user.id,
            teacher_code: teacherCode,
            created_by: user!.id
          })
          .select();

        console.log('Credential creation result:', { credentialData, credentialError });

        if (credentialError) {
          console.error('Credential creation error:', credentialError);
          throw credentialError;
        }

        toast({
          title: "Teacher Account Created!",
          description: `Teacher account created successfully. Teacher Code: ${teacherCode}`,
        });

        setShowCreateModal(false);
        resetForm();
        fetchTeachers();
      }
    } catch (error: any) {
      console.error('Error creating teacher account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher account.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const toggleTeacherStatus = async (teacherId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('teacher_credentials')
        .update({ is_active: !currentStatus })
        .eq('id', teacherId); // fixed: use id, not teacher_id

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Teacher account ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update teacher status.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      ageGroup: "21+"
    });
    setShowPassword(false);
  };

  // Show error if user is not authenticated or not an admin
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to access teacher management.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Access Denied</h3>
          <p className="text-muted-foreground">You must be an admin to access teacher management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Teacher Management</span>
          </h2>
          <p className="text-muted-foreground">
            Create and manage teacher accounts
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Teacher Account</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>Create New Teacher Account</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={createTeacherAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Select value={formData.ageGroup} onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="21+">21+ years</SelectItem>
                    <SelectItem value="16-20">16-20 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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
                {loading ? "Creating Account..." : "Create Teacher Account"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Accounts</CardTitle>
          <CardDescription>
            Manage all teacher accounts and their access codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teacher Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    {teacher.profile ? 
                      `${teacher.profile.first_name} ${teacher.profile.last_name}` : 
                      'Profile not found'
                    }
                  </TableCell>
                  <TableCell>
                    {teacher.profile?.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {teacher.teacher_code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.is_active ? "default" : "secondary"}>
                      {teacher.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTeacherStatus(teacher.id, teacher.is_active)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


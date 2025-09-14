import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Lightbulb,
  BookOpen,
  Heart,
  Dumbbell,
  MessageSquare,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface AISuggestion {
  id: string;
  title: string;
  content: string;
  suggestion_type: string;
  target_audience: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export function AISuggestionsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<AISuggestion | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    suggestion_type: "tip",
    target_audience: "all"
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and content.",
        variant: "destructive"
      });
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .insert({
          title: formData.title,
          content: formData.content,
          suggestion_type: formData.suggestion_type,
          target_audience: formData.target_audience,
          created_by: user!.id
        });

      if (error) throw error;

      toast({
        title: "Suggestion Created!",
        description: "Your AI suggestion has been added successfully.",
      });

      setShowCreateModal(false);
      resetForm();
      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create suggestion.",
        variant: "destructive"
      });
    }
    setActionLoading(false);
  };

  const updateSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSuggestion || !formData.title || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({
          title: formData.title,
          content: formData.content,
          suggestion_type: formData.suggestion_type,
          target_audience: formData.target_audience
        })
        .eq('id', editingSuggestion.id);

      if (error) throw error;

      toast({
        title: "Suggestion Updated!",
        description: "Your AI suggestion has been updated successfully.",
      });

      setEditingSuggestion(null);
      resetForm();
      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update suggestion.",
        variant: "destructive"
      });
    }
    setActionLoading(false);
  };

  const toggleSuggestionStatus = async (suggestionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ is_active: !currentStatus })
        .eq('id', suggestionId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Suggestion ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update suggestion status.",
        variant: "destructive"
      });
    }
  };

  const deleteSuggestion = async (suggestionId: string) => {
    if (!confirm("Are you sure you want to delete this suggestion?")) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .delete()
        .eq('id', suggestionId);

      if (error) throw error;

      toast({
        title: "Suggestion Deleted",
        description: "The suggestion has been removed successfully.",
      });

      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete suggestion.",
        variant: "destructive"
      });
    }
    setActionLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      suggestion_type: "tip",
      target_audience: "all"
    });
    setEditingSuggestion(null);
  };

  const openEditModal = (suggestion: AISuggestion) => {
    setEditingSuggestion(suggestion);
    setFormData({
      title: suggestion.title,
      content: suggestion.content,
      suggestion_type: suggestion.suggestion_type,
      target_audience: suggestion.target_audience
    });
  };

  const getCategoryIcon = (suggestion_type: string) => {
    switch (suggestion_type) {
      case 'tip': return <Lightbulb className="h-4 w-4" />;
      case 'fact': return <Heart className="h-4 w-4" />;
      case 'reminder': return <Dumbbell className="h-4 w-4" />;
      case 'motivation': return <MessageSquare className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (suggestion_type: string) => {
    switch (suggestion_type) {
      case 'tip': return { variant: 'default' as const, label: 'Tip' };
      case 'fact': return { variant: 'secondary' as const, label: 'Fact' };
      case 'reminder': return { variant: 'outline' as const, label: 'Reminder' };
      case 'motivation': return { variant: 'destructive' as const, label: 'Motivation' };
      default: return { variant: 'outline' as const, label: suggestion_type };
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'all': return { variant: 'default' as const, label: 'Everyone' };
      case 'students': return { variant: 'secondary' as const, label: 'Students' };
      case 'teachers': return { variant: 'outline' as const, label: 'Teachers' };
      default: return { variant: 'outline' as const, label: audience };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AI suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Award className="h-6 w-6 text-primary" />
            <span>AI Suggestions Manager</span>
          </h2>
          <p className="text-muted-foreground">
            Create and manage daily tips, facts, and suggestions for students
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Suggestion</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span>Create AI Suggestion</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={createSuggestion} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter suggestion title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the suggestion content..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="suggestion_type">Type</Label>
                  <Select value={formData.suggestion_type} onValueChange={(value) => setFormData({ ...formData, suggestion_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tip">Tip</SelectItem>
                      <SelectItem value="fact">Fact</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="motivation">Motivation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="teachers">Teachers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Suggestion</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suggestions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>AI Suggestions</span>
          </CardTitle>
          <CardDescription>
            Manage daily tips, facts, and educational content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(suggestions) ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => {
                  const categoryBadge = getCategoryBadge(suggestion.suggestion_type);
                  const audienceBadge = getAudienceBadge(suggestion.target_audience);
                  
                  return (
                    <TableRow key={suggestion.id}>
                      <TableCell>
                        <div className="font-medium">{suggestion.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {suggestion.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoryBadge.variant} className="flex items-center space-x-1 w-fit">
                          {getCategoryIcon(suggestion.suggestion_type)}
                          <span>{categoryBadge.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={audienceBadge.variant}>
                          {audienceBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={suggestion.is_active}
                            onCheckedChange={() => toggleSuggestionStatus(suggestion.id, suggestion.is_active)}
                          />
                          <span className="text-sm">
                            {suggestion.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditModal(suggestion)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteSuggestion(suggestion.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-destructive">
              <p>Failed to load suggestions. Please refresh.</p>
            </div>
          )}

          {suggestions.length === 0 && (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No AI suggestions created yet</p>
              <p className="text-sm text-muted-foreground">Start by adding your first suggestion</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingSuggestion} onOpenChange={(open) => {
        if (!open) setEditingSuggestion(null);
      }}>
        <DialogContent className="sm:max-w-2xl" closeOnOverlayClick={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-primary" />
              <span>Edit AI Suggestion</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={updateSuggestion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter suggestion title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Enter the suggestion content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-suggestion_type">Type</Label>
                <Select value={formData.suggestion_type} onValueChange={(value) => setFormData({ ...formData, suggestion_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tip">Tip</SelectItem>
                    <SelectItem value="fact">Fact</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="motivation">Motivation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-audience">Target Audience</Label>
                <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingSuggestion(null)}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center space-x-2" disabled={actionLoading}>
                <Edit className="h-4 w-4" />
                <span>{actionLoading ? "Updating..." : "Update Suggestion"}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


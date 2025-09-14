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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Send, 
  Users, 
  User, 
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age_group: string;
}

interface Message {
  id: string;
  subject: string;
  content: string;
  message_type: string;
  is_broadcast: boolean;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  recipient: {
    first_name: string;
    last_name: string;
  } | null;
}

export function MessageStudents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    messageType: "feedback",
    isBroadcast: false
  });

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchMessages();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students...');
      console.log('Current user:', user?.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, age_group, role')
        .eq('role', 'student')
        .order('first_name');

      console.log('Students query result:', { data, error });

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      
      const studentList = data?.map(s => ({ id: s.user_id, ...s })) || [];
      console.log('Students found:', studentList.length);
      console.log('Student details:', studentList);
      setStudents(studentList);
      
      if (studentList.length === 0) {
        console.log('No students found - this might be expected if no students have been created yet');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch messages.",
        variant: "destructive"
      });
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject and content.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.isBroadcast && selectedStudents.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one student or choose broadcast message.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Sending message:', { 
        isBroadcast: formData.isBroadcast, 
        selectedStudents: selectedStudents.length,
        messageType: formData.messageType 
      });

      if (formData.isBroadcast) {
        // Send broadcast message to all students
        const { error } = await supabase
          .from('messages')
          .insert({
            sender_id: user!.id,
            subject: formData.subject,
            content: formData.content,
            message_type: formData.messageType,
            is_broadcast: true,
            recipient_id: null
          });

        if (error) {
          console.error('Broadcast message error:', error);
          throw error;
        }

        console.log('Broadcast message sent successfully');
        toast({
          title: "✅ Broadcast Message Sent!",
          description: "Your message has been sent to all students.",
        });
      } else {
        // Send individual messages to selected students
        const messagePromises = selectedStudents.map(studentId =>
          supabase
            .from('messages')
            .insert({
              sender_id: user!.id,
              recipient_id: studentId,
              subject: formData.subject,
              content: formData.content,
              message_type: formData.messageType,
              is_broadcast: false
            })
        );

        const results = await Promise.all(messagePromises);
        const errors = results.filter(result => result.error);

        if (errors.length > 0) {
          console.error('Individual message errors:', errors);
          throw new Error(`Failed to send ${errors.length} messages`);
        }

        console.log('Individual messages sent successfully');
        toast({
          title: "✅ Messages Sent!",
          description: `Your message has been sent to ${selectedStudents.length} student(s).`,
        });
      }

      setShowComposeModal(false);
      resetForm();
      fetchMessages();
    } catch (error: any) {
      console.error('Send message error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message(s).",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      content: "",
      messageType: "feedback",
      isBroadcast: false
    });
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const deselectAllStudents = () => {
    setSelectedStudents([]);
  };

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case 'feedback': return { variant: 'default' as const, label: 'Feedback' };
      case 'announcement': return { variant: 'secondary' as const, label: 'Announcement' };
      case 'suggestion': return { variant: 'outline' as const, label: 'Suggestion' };
      case 'reminder': return { variant: 'destructive' as const, label: 'Reminder' };
      default: return { variant: 'outline' as const, label: type };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
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
            <MessageSquare className="h-6 w-6 text-primary" />
            <span>Message Students</span>
          </h2>
          <p className="text-muted-foreground">
            Send feedback, announcements, and suggestions to students
          </p>
        </div>
        
        <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Compose Message</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-primary" />
                <span>Compose Message</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={sendMessage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter message subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type</Label>
                <Select value={formData.messageType} onValueChange={(value) => setFormData({ ...formData, messageType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your message content..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="broadcast"
                    checked={formData.isBroadcast}
                    onCheckedChange={(checked) => setFormData({ ...formData, isBroadcast: checked as boolean })}
                  />
                  <Label htmlFor="broadcast">Send to all students (Broadcast)</Label>
                </div>

                {!formData.isBroadcast && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Select Recipients</Label>
                      <div className="space-x-2">
                        <Button type="button" variant="outline" size="sm" onClick={selectAllStudents}>
                          Select All
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={deselectAllStudents}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                      {students.length > 0 ? (
                        students.map((student) => (
                          <div key={student.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={student.id}
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleStudentSelection(student.id)}
                            />
                            <Label htmlFor={student.id} className="flex-1">
                              {student.first_name} {student.last_name} ({student.age_group})
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <Users className="h-8 w-8 mx-auto mb-2" />
                          <p>No students found</p>
                          <p className="text-sm">Students need to be created first</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudents.length} student(s) selected
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowComposeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Message History</span>
          </CardTitle>
          <CardDescription>
            View all messages you've sent to students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => {
                const typeBadge = getMessageTypeBadge(message.message_type);
                return (
                  <TableRow key={message.id}>
                    <TableCell>
                      <Badge variant={typeBadge.variant}>
                        {typeBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{message.subject}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {message.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.is_broadcast ? (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>All Students</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {message.recipient
                              ? `${message.recipient.first_name} ${message.recipient.last_name}`
                              : message.recipient_id
                                ? `User ID: ${message.recipient_id}`
                                : 'Unknown'}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {message.is_read ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Read</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Unread</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(message.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages sent yet</p>
              <p className="text-sm text-muted-foreground">Start by composing your first message to students</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


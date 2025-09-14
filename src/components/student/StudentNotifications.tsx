import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Heart,
  Dumbbell,
  BookOpen,
  Award,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface Message {
  id: string;
  subject: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  sender: {
    first_name: string;
    last_name: string;
  };
}

interface AISuggestion {
  id: string;
  title: string;
  content: string;
  suggestion_type: string;
  created_at: string;
}

export function StudentNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }

    // Cleanup subscription on unmount
    return () => {
      if (user) {
        supabase.removeAllChannels();
      }
    };
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    // Subscribe to messages table changes
    const messagesChannel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(recipient_id.eq.${user.id},and(is_broadcast.eq.true,recipient_id.is.null))`
        },
        (payload) => {
          console.log('Messages table changed:', payload);
          // Refresh messages when there are changes
          fetchMessages();
        }
      )
      .subscribe();

    // Subscribe to AI suggestions table changes
    const suggestionsChannel = supabase
      .channel('ai_suggestions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_suggestions',
          filter: 'is_active=eq.true'
        },
        (payload) => {
          console.log('AI suggestions table changed:', payload);
          // Refresh suggestions when there are changes
          fetchAiSuggestions();
        }
      )
      .subscribe();
  };

  const fetchMessages = async () => {
    try {
      // First fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`recipient_id.eq.${user!.id},and(is_broadcast.eq.true,recipient_id.is.null)`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      // Then fetch sender profiles separately
      if (messagesData && messagesData.length > 0) {
        const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', senderIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Combine messages with sender data
        const messagesWithSenders = messagesData.map(message => ({
          ...message,
          sender: profilesData?.find(profile => profile.user_id === message.sender_id) || {
            first_name: 'Unknown',
            last_name: 'User'
          }
        }));

        setMessages(messagesWithSenders);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchAiSuggestions = async () => {
    try {
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('is_active', true)
        .in('target_audience', ['all', 'students'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (suggestionsError) {
        console.error('Error fetching AI suggestions:', suggestionsError);
        // Don't throw error for AI suggestions, just log it
        setAiSuggestions([]);
        return;
      }

      setAiSuggestions(suggestionsData || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      // Don't show error toast for AI suggestions, just log it
      setAiSuggestions([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMessages(), fetchAiSuggestions()]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
      toast({
        title: "Refreshed",
        description: "Notifications updated successfully.",
      });
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        toast({
          title: "Error",
          description: "Failed to mark message as read.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        )
      );

      toast({
        title: "Message Read",
        description: "Message marked as read.",
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark message as read.",
        variant: "destructive"
      });
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'reminder': return <AlertCircle className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
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

  const getSuggestionIcon = (category: string) => {
    switch (category) {
      case 'nutrition_tip': return <Lightbulb className="h-4 w-4" />;
      case 'health_fact': return <Heart className="h-4 w-4" />;
      case 'exercise_tip': return <Dumbbell className="h-4 w-4" />;
      case 'motivation': return <MessageSquare className="h-4 w-4" />;
      case 'recipe': return <BookOpen className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getSuggestionBadge = (category: string) => {
    switch (category) {
      case 'nutrition_tip': return { variant: 'default' as const, label: 'Nutrition Tip' };
      case 'health_fact': return { variant: 'secondary' as const, label: 'Health Fact' };
      case 'exercise_tip': return { variant: 'outline' as const, label: 'Exercise Tip' };
      case 'motivation': return { variant: 'destructive' as const, label: 'Motivation' };
      case 'recipe': return { variant: 'default' as const, label: 'Recipe' };
      default: return { variant: 'outline' as const, label: category };
    }
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Bell className="h-6 w-6 text-primary" />
              <span>Notifications</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Stay updated with messages and AI suggestions
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Messages Loading Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Suggestions Loading Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>AI Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
            <Bell className="h-6 w-6 text-primary" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">
            Stay updated with messages and AI suggestions
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>Refresh</span>
        </Button>
      </div>

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Messages from Teachers</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Feedback, announcements, and suggestions from your teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => {
                const typeBadge = getMessageTypeBadge(message.message_type);
                return (
                  <div 
                    key={message.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      !message.is_read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.is_read) {
                        markMessageAsRead(message.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getMessageTypeIcon(message.message_type)}
                          <Badge variant={typeBadge.variant}>
                            {typeBadge.label}
                          </Badge>
                          {!message.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <h4 className="font-medium text-lg">{message.subject}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          From: {message.sender?.first_name} {message.sender?.last_name}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {message.content}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(message.created_at).toLocaleDateString()}</span>
                        </div>
                        {message.is_read && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Read</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground">Your teachers will send you feedback and updates here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Daily Tips & Facts</span>
          </CardTitle>
          <CardDescription>
            AI-powered nutrition tips and health facts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiSuggestions.length > 0 ? (
              aiSuggestions.map((suggestion) => {
                const suggestionBadge = getSuggestionBadge(suggestion.category);
                return (
                  <div 
                    key={suggestion.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedSuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getSuggestionIcon(suggestion.category)}
                          <Badge variant={suggestionBadge.variant}>
                            {suggestionBadge.label}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-lg">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {suggestion.content}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tips available</p>
                <p className="text-sm text-muted-foreground">Check back later for daily nutrition tips</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedMessage && getMessageTypeIcon(selectedMessage.message_type)}
              <span>{selectedMessage?.subject}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={getMessageTypeBadge(selectedMessage.message_type).variant}>
                  {getMessageTypeBadge(selectedMessage.message_type).label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  From: {selectedMessage.sender?.first_name} {selectedMessage.sender?.last_name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedMessage.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suggestion Detail Modal */}
      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedSuggestion && getSuggestionIcon(selectedSuggestion.category)}
              <span>{selectedSuggestion?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={getSuggestionBadge(selectedSuggestion.category).variant}>
                  {getSuggestionBadge(selectedSuggestion.category).label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedSuggestion.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedSuggestion.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


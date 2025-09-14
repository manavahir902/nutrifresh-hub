import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  MessageCircle,
  Lightbulb,
  Heart,
  Apple,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface QuickQuestion {
  id: string;
  question: string;
  icon: React.ComponentType<any>;
  category: string;
}

const quickQuestions: QuickQuestion[] = [
  {
    id: '1',
    question: 'What should I eat for breakfast?',
    icon: Apple,
    category: 'meal-planning'
  },
  {
    id: '2',
    question: 'How many calories should I eat daily?',
    icon: Zap,
    category: 'calories'
  },
  {
    id: '3',
    question: 'What are good protein sources?',
    icon: Heart,
    category: 'nutrition'
  },
  {
    id: '4',
    question: 'Tips for healthy snacking?',
    icon: Lightbulb,
    category: 'tips'
  }
];

// Enhanced AI Response using multiple free AI services
const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    // Create a detailed nutrition-focused prompt
    const prompt = `You are a professional nutritionist and health coach specializing in Indian cuisine and student wellness. Provide practical, evidence-based advice about nutrition, healthy eating, meal planning, and wellness for young adults. Keep responses helpful, concise (2-3 paragraphs), and actionable. Focus on Indian food, practical cooking tips, and realistic advice for busy students.

User question: ${userMessage}

Response:`;

    // Try multiple free AI services for better reliability
    const aiServices = [
      {
        name: 'Hugging Face DialoGPT',
        url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        headers: {
          'Authorization': 'Bearer hf_your_token_here',
          'Content-Type': 'application/json',
        }
      },
      {
        name: 'Hugging Face Flan-T5',
        url: 'https://api-inference.huggingface.co/models/google/flan-t5-large',
        headers: {
          'Authorization': 'Bearer hf_your_token_here',
          'Content-Type': 'application/json',
        }
      }
    ];

    for (const service of aiServices) {
      try {
        const response = await fetch(service.url, {
          method: 'POST',
          headers: service.headers,
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 300,
              temperature: 0.8,
              do_sample: true,
              return_full_text: false
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const fullResponse = data[0]?.generated_text || '';
          const trimmedResponse = fullResponse.replace(prompt, '').trim();
          
          if (trimmedResponse && trimmedResponse.length > 20) {
            console.log(`AI response from ${service.name}:`, trimmedResponse);
            return trimmedResponse;
          }
        }
      } catch (serviceError) {
        console.log(`${service.name} failed:`, serviceError);
        continue;
      }
    }

    // If all AI services fail, use enhanced fallback
    return getEnhancedFallbackResponse(userMessage);
  } catch (error) {
    console.error('All AI services failed:', error);
    return getEnhancedFallbackResponse(userMessage);
  }
};

// Enhanced fallback responses with better Indian nutrition advice
const getEnhancedFallbackResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Indian breakfast suggestions
  if (message.includes('breakfast') || message.includes('morning meal')) {
    return "For a healthy Indian breakfast, try these nutritious options:\n\n• **Poha with vegetables** - Light, easy to digest, and packed with iron\n• **Idli with sambar** - Protein-rich and probiotic-friendly\n• **Oats upma** - High fiber with Indian spices\n• **Besan chilla** - High protein pancake with vegetables\n\nStart your day with 300-500 calories to fuel your morning activities!";
  }
  
  // Indian lunch ideas
  if (message.includes('lunch') || message.includes('afternoon meal')) {
    return "For a balanced Indian lunch, include:\n\n• **Dal with rice/roti** - Complete protein with carbohydrates\n• **Vegetable curry** - Rich in vitamins and minerals\n• **Raita or curd** - Probiotics and calcium\n• **Green salad** - Fresh vegetables for fiber\n\nAim for 500-700 calories with a good mix of protein, carbs, and healthy fats!";
  }
  
  // Weight management
  if (message.includes('weight') || message.includes('lose') || message.includes('gain')) {
    return "For healthy weight management with Indian food:\n\n**To lose weight:**\n• Control portion sizes of rice/roti\n• Include more vegetables and dal\n• Limit fried foods and sweets\n• Stay hydrated with water and buttermilk\n\n**To gain weight:**\n• Add nuts and dry fruits to meals\n• Include ghee and healthy oils\n• Eat more protein-rich foods like paneer, dal, and eggs\n• Have healthy snacks between meals";
  }
  
  // General nutrition advice
  if (message.includes('healthy') || message.includes('nutrition')) {
    return "Here are key nutrition tips for Indian students:\n\n• **Eat seasonal fruits and vegetables** - They're fresher and more nutritious\n• **Include all food groups** - Grains, pulses, vegetables, fruits, dairy\n• **Stay hydrated** - Drink 8-10 glasses of water daily\n• **Limit processed foods** - Choose homemade meals when possible\n• **Eat regular meals** - Don't skip breakfast or lunch";
  }
  
  // Default response
  return "I'm here to help with your nutrition questions! Ask me about:\n\n• Healthy Indian breakfast ideas\n• Balanced lunch and dinner options\n• Weight management tips\n• Meal planning for students\n• Nutritional benefits of Indian foods\n\nWhat would you like to know about healthy eating?";
};

// Fallback responses when AI service is unavailable
const getFallbackResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Breakfast questions
  if (message.includes('breakfast') || message.includes('morning meal')) {
    return "For a healthy breakfast, try combining complex carbohydrates, protein, and healthy fats. Great options include:\n\n• Oatmeal with berries and nuts\n• Greek yogurt with granola\n• Whole grain toast with avocado\n• Scrambled eggs with vegetables\n\nAim for 300-500 calories to fuel your morning!";
  }
  
  // Calorie questions
  if (message.includes('calorie') || message.includes('calories')) {
    return "Daily calorie needs depend on your age, weight, height, and activity level. Here's a general guide:\n\n• **Teenagers (13-17)**: 1,800-2,400 calories\n• **Young adults (18-25)**: 2,000-2,600 calories\n• **Adults (26-50)**: 1,800-2,400 calories\n\nFor weight loss: Reduce by 500 calories/day\nFor weight gain: Increase by 500 calories/day\n\nRemember: Quality matters more than quantity!";
  }
  
  // Protein questions
  if (message.includes('protein') || message.includes('muscle')) {
    return "Excellent protein sources include:\n\n**Animal sources:**\n• Chicken breast, turkey, fish\n• Eggs and dairy products\n• Lean beef and pork\n\n**Plant sources:**\n• Beans, lentils, chickpeas\n• Nuts and seeds\n• Quinoa and tofu\n\n**Daily protein needs:**\n• Teens: 0.8-1g per kg body weight\n• Adults: 0.8-1.2g per kg body weight\n\nAim to include protein in every meal!";
  }
  
  // Snacking questions
  if (message.includes('snack') || message.includes('snacking')) {
    return "Healthy snacking tips:\n\n**Smart snack choices:**\n• Fresh fruits and vegetables\n• Nuts and seeds (small portions)\n• Greek yogurt or cottage cheese\n• Hummus with veggies\n• Hard-boiled eggs\n\n**Timing:**\n• Snack 2-3 hours after meals\n• Stop eating 2-3 hours before bed\n\n**Portion control:**\n• Keep snacks under 200 calories\n• Pre-portion snacks to avoid overeating\n\nRemember: Snacks should complement, not replace, your main meals!";
  }
  
  // Weight management
  if (message.includes('weight') || message.includes('lose') || message.includes('gain')) {
    return "Healthy weight management involves:\n\n**For weight loss:**\n• Create a moderate calorie deficit (500 cal/day)\n• Focus on whole, unprocessed foods\n• Increase protein and fiber intake\n• Stay hydrated and get enough sleep\n\n**For weight gain:**\n• Eat calorie-dense, nutritious foods\n• Include healthy fats (nuts, avocado, olive oil)\n• Strength training to build muscle\n• Eat more frequently throughout the day\n\n**Remember:** Sustainable changes work better than quick fixes!";
  }
  
  // Hydration
  if (message.includes('water') || message.includes('hydrat') || message.includes('drink')) {
    return "Hydration is crucial for health! Here's what you need to know:\n\n**Daily water needs:**\n• Teens: 8-10 glasses (2-2.5 liters)\n• Adults: 8-12 glasses (2-3 liters)\n• More if you're active or in hot weather\n\n**Signs of good hydration:**\n• Light yellow urine\n• Feeling energetic\n• Clear skin\n\n**Tips:**\n• Start your day with a glass of water\n• Keep a water bottle with you\n• Eat water-rich foods (fruits, vegetables)\n• Limit sugary drinks and excessive caffeine";
  }
  
  // Vitamins and minerals
  if (message.includes('vitamin') || message.includes('mineral') || message.includes('supplement')) {
    return "Essential vitamins and minerals for teens and young adults:\n\n**Key nutrients:**\n• **Vitamin D**: Sunlight, fatty fish, fortified foods\n• **Calcium**: Dairy, leafy greens, fortified foods\n• **Iron**: Lean meats, beans, spinach\n• **B12**: Animal products, fortified foods\n• **Folate**: Leafy greens, beans, citrus fruits\n\n**Best approach:**\n• Get nutrients from whole foods first\n• Consider supplements only if deficient\n• Consult a healthcare provider for personalized advice\n\nA balanced diet usually provides all needed nutrients!";
  }
  
  // Exercise and nutrition
  if (message.includes('exercise') || message.includes('workout') || message.includes('fitness')) {
    return "Nutrition for exercise and fitness:\n\n**Pre-workout (1-2 hours before):**\n• Light meal with carbs and protein\n• Examples: Banana with peanut butter, yogurt with berries\n\n**Post-workout (within 30 minutes):**\n• Protein and carbs for recovery\n• Examples: Protein shake, chicken with rice, Greek yogurt\n\n**Hydration:**\n• Drink water before, during, and after exercise\n• For intense workouts >1 hour, consider sports drinks\n\n**Daily needs:**\n• Active individuals need more calories and protein\n• Focus on whole foods for sustained energy";
  }
  
  // Default response
  return "I'm here to help with nutrition questions! I can provide guidance on:\n\n• Meal planning and healthy eating\n• Calorie and macronutrient needs\n• Weight management strategies\n• Hydration and supplements\n• Exercise nutrition\n• Healthy snacking\n\nFeel free to ask me anything about nutrition and healthy living!";
};

export function NutritionChatbot() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your nutrition assistant. I can help you with meal planning, calorie counting, healthy eating tips, and more. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(userMessage.content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: QuickQuestion) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question.question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(question.question);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Nutrition Assistant</h2>
      </div>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {quickQuestions.map((question) => {
              const Icon = question.icon;
              return (
                <Button
                  key={question.id}
                  variant="outline"
                  className="h-auto p-4 justify-start text-left"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{question.question}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Chat with Nutrition Assistant</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex items-center space-x-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input */}
          <div className="flex-shrink-0 p-6 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about nutrition..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

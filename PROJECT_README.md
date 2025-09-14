# 🍎 NutriEdu - Smart Nutrition Education Platform

A comprehensive nutrition education platform built with React, TypeScript, and Supabase, designed to help students and teachers manage meal plans, track nutrition, and learn about healthy eating habits.

## ✨ Features

### 🎯 **Core Features**
- **Authentication & Role Management**: Secure login with student, teacher, and admin roles
- **Real-time Messaging**: Teacher-student communication with instant notifications
- **Dynamic Meal Planning**: AI-powered meal plan generation based on user profiles
- **Nutrition Tracking**: Comprehensive dashboard with calorie and macronutrient tracking
- **AI Chatbot**: Interactive nutrition assistant for Q&A and guidance

### 🚀 **Advanced Features**
- **Weekly Calendar View**: Visual meal planning with drag-and-drop functionality
- **Personalized Recommendations**: Meal plans tailored to age, weight, goals, and dietary preferences
- **Progress Tracking**: Streak tracking, achievements, and goal monitoring
- **Real-time Updates**: Live notifications and data synchronization
- **Responsive Design**: Mobile-first design with beautiful UI/UX

### 🛡️ **Security & Performance**
- **Row Level Security (RLS)**: Database-level security with Supabase
- **Protected Routes**: Role-based access control
- **Error Boundaries**: Comprehensive error handling and recovery
- **Loading States**: Smooth user experience with loading indicators
- **Optimized Queries**: Efficient database queries with proper indexing

## 🏗️ **Architecture**

### **Frontend Stack**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Query** for state management
- **Lucide React** for icons

### **Backend Stack**
- **Supabase** for backend-as-a-service
- **PostgreSQL** database with RLS
- **Real-time subscriptions** for live updates
- **Edge Functions** for serverless logic
- **Authentication** with JWT tokens

### **Database Schema**
```
📊 Core Tables:
├── profiles (user information & roles)
├── student_details (health metrics & goals)
├── messages (teacher-student communication)
├── notifications (real-time alerts)
├── food_items (nutritional database)
├── student_meals (logged meals)
├── personalized_meal_plans (AI-generated plans)
├── ai_suggestions (educational content)
└── user_achievements (gamification)
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Supabase account and project
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nutrifresh-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npx supabase db reset
   
   # Apply normalization script
   # Run database-normalization.sql in Supabase SQL Editor
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📱 **User Roles & Permissions**

### **👨‍🎓 Students**
- View personalized meal plans
- Log daily meals and track nutrition
- Receive messages from teachers
- Access AI nutrition chatbot
- Track progress and achievements

### **👨‍🏫 Teachers**
- Send messages to students
- View student analytics and progress
- Generate AI meal suggestions
- Manage student meal plans
- Access comprehensive dashboard

### **👨‍💼 Admins**
- Manage teacher accounts
- View system-wide analytics
- Configure AI suggestions
- Manage food database
- System administration

## 🎨 **UI/UX Features**

### **Design System**
- **Consistent Color Palette**: Primary green theme with semantic colors
- **Typography**: Clear hierarchy with readable fonts
- **Spacing**: Consistent padding and margins
- **Components**: Reusable UI components with variants
- **Responsive**: Mobile-first design with breakpoints

### **User Experience**
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: Graceful error recovery
- **Toast Notifications**: Success and error feedback
- **Real-time Updates**: Live data synchronization
- **Accessibility**: WCAG compliant components

## 🔧 **Development**

### **Project Structure**
```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── meals/          # Meal planning components
│   ├── nutrition/      # Nutrition tracking components
│   ├── teacher/        # Teacher-specific components
│   ├── student/        # Student-specific components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── integrations/       # External service integrations
├── lib/                # Utility functions
└── utils/              # Helper functions
```

### **Key Components**

#### **Authentication System**
- `ProtectedRoute`: Route protection with role-based access
- `useAuth`: Authentication state management
- `useUserRole`: User role and profile management

#### **Meal Planning**
- `WeeklyMealPlanView`: Calendar-style meal planning
- `NutritionDashboard`: Comprehensive nutrition tracking
- `MealPlanGenerator`: AI-powered meal plan creation

#### **Communication**
- `StudentNotifications`: Real-time message display
- `MessageStudents`: Teacher messaging interface
- `NutritionChatbot`: AI assistant for nutrition Q&A

### **Database Functions**
- `get_daily_nutrition_totals()`: Calculate daily nutrition
- `create_message_notification()`: Auto-create notifications
- `create_ai_suggestion_notification()`: AI suggestion alerts

## 🧪 **Testing**

### **Manual Testing Checklist**
- [ ] User registration and login
- [ ] Role-based access control
- [ ] Real-time messaging
- [ ] Meal plan generation
- [ ] Nutrition tracking
- [ ] AI chatbot functionality
- [ ] Mobile responsiveness
- [ ] Error handling

### **Performance Optimization**
- Lazy loading for route components
- Optimized database queries
- Efficient state management
- Image optimization
- Bundle size optimization

## 🚀 **Deployment**

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
# Connect your repository and deploy
```

### **Database Deployment**
```bash
# Apply migrations to production
npx supabase db push

# Run normalization script
# Execute database-normalization.sql in production
```

## 📊 **Analytics & Monitoring**

### **User Analytics**
- Daily active users
- Feature usage statistics
- User engagement metrics
- Performance monitoring

### **Nutrition Analytics**
- Meal logging frequency
- Goal achievement rates
- Popular food items
- Nutritional trends

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] Mobile app (React Native)
- [ ] Advanced AI meal recommendations
- [ ] Social features and challenges
- [ ] Integration with fitness trackers
- [ ] Barcode scanning for food logging
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Gamification elements

### **Technical Improvements**
- [ ] Unit and integration tests
- [ ] Performance monitoring
- [ ] Advanced caching strategies
- [ ] Offline support
- [ ] Progressive Web App (PWA)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **Supabase** for the amazing backend platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **React Query** for excellent state management

## 📞 **Support**

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for better nutrition education**

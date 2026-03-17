# Developer Quick Reference Guide

## 🎯 Quick Start

### Run the App
```bash
npm install
npm run dev
```

### Test Different Roles
Quick login credentials for testing:
- **Student**: `student@demo.com` / any password
- **Teacher**: `teacher@demo.com` / any password  
- **Admin**: `admin@demo.com` / any password

## 📂 Important Files

### Core Files
- `src/app/App.tsx` - Main routing configuration
- `src/store/authStore.ts` - Authentication state management
- `src/store/appStore.ts` - Global app state

### Type Definitions
- `src/types/auth.ts` - Auth & user types
- `src/types/index.ts` - Main app types
- `src/types/teacher.ts` - Teacher-specific types
- `src/types/curriculum.ts` - Curriculum types
- `src/types/assessment.ts` - Assessment types

### Layout Components
- `src/app/components/layout/AppLayout.tsx` - Main layout wrapper
- `src/app/components/layout/Sidebar.tsx` - Desktop sidebar navigation
- `src/app/components/layout/Topbar.tsx` - Top navigation bar
- `src/app/components/layout/MobileBottomNav.tsx` - Mobile bottom navigation
- `src/app/components/layout/ProtectedRoute.tsx` - Route protection HOC

## 🎨 Design System

### Colors
```tsx
// Primary Colors (Student)
bg-green-500       // #10B981
bg-green-600       // #059669

// Teacher Colors  
bg-blue-500        // #3B82F6
bg-purple-500      // #A855F7

// Admin Colors
bg-purple-500      // #A855F7
bg-red-500         // #EF4444
```

### Border Radius
```tsx
rounded-xl         // 0.75rem - Default for cards/buttons
rounded-2xl        // 1rem - Large buttons, important cards
rounded-3xl        // 1.5rem - Logo, hero elements
```

### Shadows
```tsx
shadow-lg          // Default card shadow
shadow-xl          // Elevated cards, modals
shadow-2xl         // Hero elements, important features
```

### Gradients
```tsx
// Student
from-green-400 to-green-600

// Teacher  
from-blue-400 to-blue-600
from-purple-400 to-purple-600

// Admin
from-purple-400 to-purple-600
from-red-400 to-red-600
```

## 🔐 Authentication Flow

### Check if user is authenticated
```tsx
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Hello {user?.name}</div>;
}
```

### Login
```tsx
const { login, isLoading } = useAuthStore();

await login({ email, password });
// User is automatically redirected based on role
```

### Logout
```tsx
const { logout } = useAuthStore();

logout();
navigate('/login');
```

### Check Permissions
```tsx
const { checkPermission } = useAuthStore();

if (checkPermission('create:lessons')) {
  // Show create lesson button
}
```

## 🧭 Navigation

### Using Link (preferred)
```tsx
import { Link } from 'react-router-dom';

<Link to="/sessions">View Sessions</Link>
```

### Using useNavigate
```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/sessions');
  };
}
```

### Get current route
```tsx
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  const isActive = location.pathname === '/sessions';
}
```

## 🎭 Role-Based Features

### Get current user role
```tsx
const { user } = useAuthStore();

if (user?.role === 'student') {
  // Student-specific feature
}
```

### Role-specific navigation
```tsx
const roleDashboards = {
  student: '/',
  teacher: '/teacher',
  admin: '/admin',
};

navigate(roleDashboards[user.role]);
```

### Role-specific components
```tsx
{user?.role === 'teacher' && (
  <Button>Create Lesson</Button>
)}
```

## 🎬 Animations with Motion

### Basic animation
```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Staggered animations
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 * index }}
  >
    {item.content}
  </motion.div>
))}
```

### Spring animations
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 200 }}
>
  Logo
</motion.div>
```

## 📢 Notifications (Toast)

```tsx
import { toast } from 'sonner';

// Success
toast.success('Profile updated successfully!');

// Error
toast.error('Something went wrong');

// Info
toast.info('Logged out successfully');

// Warning
toast.warning('Please complete your profile');

// Loading
const toastId = toast.loading('Saving...');
// Later
toast.success('Saved!', { id: toastId });
```

## 🎨 UI Components (Shadcn)

### Button
```tsx
import { Button } from '@/app/components/ui/button';

<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="lg">Large</Button>
<Button size="sm">Small</Button>
```

### Card
```tsx
import { Card } from '@/app/components/ui/card';

<Card className="p-6">
  Card content
</Card>
```

### Input
```tsx
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="your@email.com"
  />
</div>
```

### Avatar
```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

<Avatar>
  <AvatarImage src={user?.avatar} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Badge
```tsx
import { Badge } from '@/app/components/ui/badge';

<Badge>Student</Badge>
<Badge className="bg-blue-500">Teacher</Badge>
```

### Switch
```tsx
import { Switch } from '@/app/components/ui/switch';

<Switch 
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

## 🚀 Adding New Features

### 1. Create a new route
```tsx
// In App.tsx
<Route path="/new-feature" element={<NewFeature />} />
```

### 2. Add navigation item
```tsx
// In Sidebar.tsx or MobileBottomNav.tsx
const navItems = [
  // ... existing items
  { title: 'New Feature', href: '/new-feature', icon: Star },
];
```

### 3. Create component
```tsx
// src/features/new-feature/NewFeature.tsx
import { motion } from 'motion/react';

export function NewFeature() {
  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">New Feature</h1>
      </motion.div>
    </div>
  );
}
```

## 🔧 Common Patterns

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(false);

if (isLoading) {
  return <div>Loading...</div>;
}
```

### Error Handling
```tsx
const [error, setError] = useState('');

try {
  await someAsyncFunction();
} catch (err: any) {
  setError(err.message);
  toast.error(err.message);
}
```

### Form Validation
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email || !password) {
    setError('Please fill all fields');
    return;
  }
  
  if (password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
  }
  
  // Submit form
};
```

## 📱 Responsive Design

### Hide on Mobile
```tsx
<div className="hidden md:block">
  Desktop only
</div>
```

### Show on Mobile
```tsx
<div className="block md:hidden">
  Mobile only
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

### Responsive Text
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

## 🐛 Debugging Tips

### Check auth state
```tsx
const { user, isAuthenticated } = useAuthStore();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);
```

### Check current route
```tsx
const location = useLocation();
console.log('Current path:', location.pathname);
```

### Check permissions
```tsx
const { user } = useAuthStore();
console.log('User permissions:', user?.permissions);
```

## 📚 Additional Resources

- [React Router Docs](https://reactrouter.com/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [Motion Docs](https://motion.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Shadcn UI Docs](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Need Help?** Check `/SPRINT_1_COMPLETION.md` for detailed feature documentation.

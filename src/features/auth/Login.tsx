import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion } from 'motion/react';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/auth';

const getRoleDashboard = (role?: string) => {
  if (role === 'teacher') return '/teacher';
  if (role === 'admin') return '/admin';
  return '/';
};

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    { id: 'student' as UserRole, title: 'Student', color: 'from-green-400 to-green-600', example: 'student@demo.com' },
    { id: 'teacher' as UserRole, title: 'Teacher', color: 'from-blue-400 to-blue-600', example: 'teacher@demo.com' },
    { id: 'admin' as UserRole, title: 'Admin', color: 'from-purple-400 to-purple-600', example: 'admin@demo.com' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login({ email, password });
      // Đọc role thực từ store (đã được set bởi authStore.login từ BE response)
      const { user } = useAuthStore.getState();
      navigate(getRoleDashboard(user?.role));
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRoleSelect = (role: UserRole, example: string) => {
    setSelectedRole(role);
    setEmail(example);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-green-600 text-white font-bold shadow-2xl text-3xl">
              E
            </div>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Sign in to continue your learning journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Login Demo
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click a role to auto-fill credentials for demo
            </p>
            <div className="space-y-3">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all duration-300 ${
                      selectedRole === role.id
                        ? 'ring-2 ring-green-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleRoleSelect(role.id, role.example)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${role.color} text-white font-bold shadow-lg`}>
                        {role.title[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {role.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {role.example}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-green-600 dark:text-green-400 hover:underline"
                  >
                    Don't have an account? Register
                  </button>
                </div>
              </form>
            </Card>

            {/* Demo info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
            >
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Demo Mode:</strong> Use any password (e.g., "demo123") with the demo emails.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Back to Welcome */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to Welcome
          </button>
        </motion.div>
      </div>
    </div>
  );
}

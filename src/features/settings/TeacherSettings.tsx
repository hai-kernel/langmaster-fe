import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  BookOpen,
  Mail,
  Save,
  LogOut,
  Users,
  Award
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function TeacherSettings() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studentUpdates, setStudentUpdates] = useState(true);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subjects, setSubjects] = useState(user?.teachingSubjects?.join(', ') || '');

  const handleSaveProfile = () => {
    updateUser({ 
      name, 
      email,
      teachingSubjects: subjects.split(',').map(s => s.trim())
    });
    toast.success('Profile updated successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Teacher Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your teaching profile and preferences
        </p>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </h2>

            {/* Avatar and Role */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                  <Badge className="bg-blue-500">Teacher</Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subjects">Teaching Subjects</Label>
                <div className="relative mt-2">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="subjects"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    placeholder="English, Pronunciation, etc."
                    className="pl-10 rounded-xl"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Separate multiple subjects with commas
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>

          {/* Teaching Stats */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Teaching Statistics
            </h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Classes</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">156</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">45</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Lessons Created</div>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email updates about your classes
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Student Progress Updates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when students complete assignments
                  </p>
                </div>
                <Switch
                  checked={studentUpdates}
                  onCheckedChange={setStudentUpdates}
                />
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-xl justify-start">
                <Users className="h-4 w-4 mr-2" />
                View All Students
              </Button>
              <Button variant="outline" className="w-full rounded-xl justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Create New Lesson
              </Button>
              <Button variant="outline" className="w-full rounded-xl justify-start">
                <Award className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </Card>

          {/* Logout */}
          <Card className="p-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

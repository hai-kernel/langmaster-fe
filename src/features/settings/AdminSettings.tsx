import { useState, useEffect } from 'react';
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
  Shield,
  Settings as SettingsIcon,
  Mail,
  Save,
  LogOut,
  Users,
  BookOpen,
  BarChart3,
  Database,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

export function AdminSettings() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [stats, setStats] = useState<{ totalStudents?: number; totalTeachers?: number; totalTopics?: number; totalSessions?: number } | null>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    let cancelled = false;
    apiService.admin.getStats().then((res) => {
      if (cancelled) return;
      const data = res.data?.data ?? res.data;
      if (data && typeof data.totalStudents === 'number') setStats(data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleSaveProfile = () => {
    updateUser({ name, email });
    toast.success('Đã cập nhật hồ sơ');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info('Đã đăng xuất');
  };

  return (
    <div className="min-h-[60vh] bg-[var(--page-bg)]">
      <div className="container mx-auto max-w-4xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-1">Cài đặt Admin</h1>
          <p className="text-muted-foreground mb-8">Quản lý cấu hình và cài đặt hệ thống</p>

          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-6 border-border bg-card text-card-foreground">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <User className="h-5 w-5" />
                Hồ sơ Admin
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">{user?.name}</h3>
                    <Badge className="bg-primary">Admin</Badge>
                    {user?.isSuperAdmin && (
                      <Badge className="bg-warning text-warning-foreground">Super Admin</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Họ tên</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl mt-2 bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl bg-background"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </Button>
              </div>
            </Card>

            {/* Platform Statistics - real data */}
            <Card className="p-6 border-border bg-card text-card-foreground">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Thống kê hệ thống
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/60">
                  <div className="text-2xl font-bold text-success">{stats?.totalStudents ?? '–'}</div>
                  <div className="text-sm text-muted-foreground">Học viên</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/60">
                  <div className="text-2xl font-bold text-primary">{stats?.totalTeachers ?? '–'}</div>
                  <div className="text-sm text-muted-foreground">Giáo viên</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/60">
                  <div className="text-2xl font-bold text-primary">{stats?.totalTopics ?? '–'}</div>
                  <div className="text-sm text-muted-foreground">Chủ đề</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/60">
                  <div className="text-2xl font-bold text-warning">{stats?.totalSessions ?? '–'}</div>
                  <div className="text-sm text-muted-foreground">Sessions</div>
                </div>
              </div>
            </Card>

            {/* System Settings */}
            <Card className="p-6 border-border bg-card text-card-foreground">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Cài đặt hệ thống
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Chế độ bảo trì</h3>
                    <p className="text-sm text-muted-foreground">Bật chế độ bảo trì hệ thống</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Cảnh báo hệ thống</h3>
                    <p className="text-sm text-muted-foreground">Nhận cảnh báo sự cố</p>
                  </div>
                  <Switch checked={systemAlerts} onCheckedChange={setSystemAlerts} />
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6 border-border bg-card text-card-foreground">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Thông báo
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Email thông báo</h3>
                    <p className="text-sm text-muted-foreground">Nhận email cập nhật hoạt động hệ thống</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 border-border bg-card text-card-foreground">
              <h2 className="text-lg font-semibold text-foreground mb-6">Thao tác nhanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="rounded-xl justify-start gap-2" onClick={() => navigate('/admin/users')}>
                  <Users className="h-4 w-4" />
                  Quản lý người dùng
                </Button>
                <Button variant="outline" className="rounded-xl justify-start gap-2" onClick={() => navigate('/admin/content')}>
                  <BookOpen className="h-4 w-4" />
                  Quản lý nội dung
                </Button>
                <Button variant="outline" className="rounded-xl justify-start gap-2" onClick={() => navigate('/admin/analytics')}>
                  <BarChart3 className="h-4 w-4" />
                  Thống kê
                </Button>
                <Button variant="outline" className="rounded-xl justify-start gap-2" onClick={() => navigate('/admin/curriculum')}>
                  <Database className="h-4 w-4" />
                  Lộ trình học
                </Button>
                <Button variant="outline" className="rounded-xl justify-start gap-2">
                  <Shield className="h-4 w-4" />
                  Bảo mật
                </Button>
                <Button variant="outline" className="rounded-xl justify-start gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Cấu hình
                </Button>
              </div>
            </Card>

            {/* Logout */}
            <Card className="p-6 border-border bg-card">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

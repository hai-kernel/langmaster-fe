import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Bell,
  Plus,
  Send,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Megaphone,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

export function NotificationsManagement() {
  const notifications = [
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      message: 'Platform will be under maintenance on Jan 20, 2026 from 2-4 AM',
      type: 'warning',
      target: 'all',
      sentAt: '2026-01-15',
      status: 'sent',
      recipients: 1048,
    },
    {
      id: '2',
      title: 'New Feature: AI Pronunciation Coach',
      message: 'Try our new AI-powered pronunciation feedback system!',
      type: 'info',
      target: 'students',
      sentAt: '2026-01-14',
      status: 'sent',
      recipients: 892,
    },
    {
      id: '3',
      title: 'Welcome to English AI Platform',
      message: 'Thank you for joining! Start your learning journey today.',
      type: 'success',
      target: 'new_users',
      sentAt: '2026-01-16',
      status: 'sent',
      recipients: 45,
    },
  ];

  const typeColors = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === 'sent').length,
    totalRecipients: notifications.reduce((sum, n) => sum + n.recipients, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-400 to-pink-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Bell className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Notifications Management</h1>
                <p className="text-pink-50">Send announcements and alerts to users</p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-pink-600 hover:bg-pink-50 gap-2">
                  <Plus className="h-5 w-5" />
                  Create Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Notification</DialogTitle>
                  <DialogDescription>
                    Send a notification to users across the platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="notif-title">Title</Label>
                    <Input
                      id="notif-title"
                      placeholder="Enter notification title"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notif-message">Message</Label>
                    <Textarea
                      id="notif-message"
                      placeholder="Enter notification message"
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="notif-type">Type</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notif-target">Target Audience</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="students">Students Only</SelectItem>
                          <SelectItem value="teachers">Teachers Only</SelectItem>
                          <SelectItem value="admins">Admins Only</SelectItem>
                          <SelectItem value="new_users">New Users</SelectItem>
                          <SelectItem value="inactive">Inactive Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-pink-500 hover:bg-pink-600 gap-2">
                    <Send className="h-4 w-4" />
                    Send Notification
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Megaphone className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-pink-50">Total Sent</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.sent}</div>
                  <div className="text-sm text-pink-50">Delivered</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalRecipients}</div>
                  <div className="text-sm text-pink-50">Total Reach</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon & Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 p-4 rounded-2xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <Badge
                        className={
                          typeColors[notification.type as keyof typeof typeColors]
                        }
                      >
                        {notification.type.charAt(0).toUpperCase() +
                          notification.type.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {notification.message}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {notification.recipients} recipients ({notification.target})
                        </span>
                      </div>
                      <div>Sent: {new Date(notification.sentAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {notification.status.charAt(0).toUpperCase() +
                      notification.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

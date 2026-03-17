import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Eye,
  RefreshCw,
  Trash2,
} from 'lucide-react';

export function FaceIDManagement() {
  const faceData = [
    {
      id: '1',
      user: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      status: 'verified',
      enrolledAt: '2025-09-01',
      lastVerified: '2026-01-16',
      verificationCount: 124,
      failedAttempts: 2,
      confidence: 98.5,
    },
    {
      id: '2',
      user: 'Trần Thị B',
      email: 'tranthib@email.com',
      status: 'verified',
      enrolledAt: '2025-09-05',
      lastVerified: '2026-01-16',
      verificationCount: 98,
      failedAttempts: 0,
      confidence: 99.2,
    },
    {
      id: '3',
      user: 'Lê Văn C',
      email: 'levanc@email.com',
      status: 'pending',
      enrolledAt: '2026-01-15',
      lastVerified: null,
      verificationCount: 0,
      failedAttempts: 3,
      confidence: 0,
    },
    {
      id: '4',
      user: 'Phạm Thị D',
      email: 'phamthid@email.com',
      status: 'flagged',
      enrolledAt: '2025-10-20',
      lastVerified: '2026-01-10',
      verificationCount: 45,
      failedAttempts: 12,
      confidence: 75.3,
    },
  ];

  const stats = {
    total: faceData.length,
    verified: faceData.filter((f) => f.status === 'verified').length,
    pending: faceData.filter((f) => f.status === 'pending').length,
    flagged: faceData.filter((f) => f.status === 'flagged').length,
    avgConfidence: faceData
      .filter((f) => f.confidence > 0)
      .reduce((sum, f) => sum + f.confidence, 0) / faceData.filter((f) => f.confidence > 0).length,
  };

  const statusColors = {
    verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    flagged: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'flagged':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Face ID Management</h1>
              <p className="text-blue-50">Manage biometric authentication</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-blue-50">Total Users</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.verified}</div>
                  <div className="text-sm text-blue-50">Verified</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <div className="text-sm text-blue-50">Pending</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.flagged}</div>
                  <div className="text-sm text-blue-50">Flagged</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.avgConfidence.toFixed(1)}%</div>
                  <div className="text-sm text-blue-50">Avg Confidence</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid gap-4">
          {faceData.map((face) => (
            <Card key={face.id} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">
                    {face.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {face.user}
                      </h3>
                      {getStatusIcon(face.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {face.email}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[face.status as keyof typeof statusColors]}>
                        {face.status.charAt(0).toUpperCase() + face.status.slice(1)}
                      </Badge>
                      {face.failedAttempts > 5 && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {face.failedAttempts} Failed Attempts
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Enrolled
                    </div>
                    <div className="text-sm font-semibold">
                      {new Date(face.enrolledAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Verifications
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {face.verificationCount}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Failed
                    </div>
                    <div className={`text-lg font-bold ${
                      face.failedAttempts > 5 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {face.failedAttempts}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Confidence
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {face.confidence > 0 ? `${face.confidence.toFixed(1)}%` : 'N/A'}
                    </div>
                    {face.confidence > 0 && (
                      <Progress value={face.confidence} className="mt-2 h-1" />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  {face.status === 'pending' && (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Verify
                    </Button>
                  )}
                  {face.status === 'flagged' && (
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Re-enroll
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-2 text-red-600">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>

              {face.lastVerified && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  Last verified: {new Date(face.lastVerified).toLocaleString()}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
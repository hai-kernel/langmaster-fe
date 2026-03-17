import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Avatar } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { useAppStore } from '@/store/appStore';
import { mockBadges, mockAchievements, getClassesByStudentId } from '@/services/mockData';
import { ArrowLeft, Trophy, Star, Users, Calendar, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export function ProfileScreen() {
  const { user, setCurrentView } = useAppStore();
  const enrolledClasses = getClassesByStudentId(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => setCurrentView('home')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600" />
          <div className="relative px-6 pb-6">
            <div className="absolute -top-16 flex items-end gap-4">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {user.level}
              </div>
              <div className="mb-2">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">Level {user.level}</p>
              </div>
            </div>

            <div className="mt-20 grid gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{user.xp}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
              </div>
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">{user.totalLessonsCompleted}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bài đã hoàn thành</p>
              </div>
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-2xl font-bold">{user.streak}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ngày liên tục</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* My Classes Section */}
      {enrolledClasses.length > 0 && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold">Lớp học của tôi</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {enrolledClasses.map((classItem) => (
              <Card 
                key={classItem.id} 
                className="overflow-hidden rounded-3xl border-2 border-gray-200 dark:border-gray-700"
              >
                <div className={`h-2 bg-gradient-to-r ${classItem.color || 'from-blue-400 to-blue-500'}`} />
                <div className="p-5">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {classItem.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ 
                        classItem.level === 'beginner' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : classItem.level === 'intermediate'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {classItem.level === 'beginner' ? 'Cơ bản' : classItem.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.description}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Teacher */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white text-sm font-bold shadow-sm">
                        {classItem.teacherName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Giáo viên</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {classItem.teacherName}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{classItem.studentCount} học viên</span>
                      </div>
                      {classItem.schedule && (
                        <>
                          <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs">{classItem.schedule}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Badges */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="mb-4 text-2xl font-bold">Huy hiệu</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockBadges.map((badge) => (
            <Card
              key={badge.id}
              className={`p-4 text-center ${
                badge.unlockedAt ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'opacity-50'
              }`}
            >
              <div className="mb-2 text-4xl">{badge.icon}</div>
              <h3 className="mb-1 font-semibold">{badge.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{badge.description}</p>
              {badge.unlockedAt && (
                <p className="mt-2 text-xs text-green-600">✓ Đã mở khóa</p>
              )}
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="mb-4 text-2xl font-bold">Thành tích</h2>
        <div className="space-y-4">
          {mockAchievements.map((achievement) => (
            <Card key={achievement.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    achievement.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">+{achievement.xpReward} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={(achievement.progress / achievement.target) * 100}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">
                  {achievement.progress}/{achievement.target}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
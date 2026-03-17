import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Loader2,
  Plus,
  BookOpen,
  Video,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

interface ScheduleEvent {
  id: string;
  title: string;
  classId: string;
  className: string;
  type: 'class' | 'meeting' | 'event';
  startTime: string;
  endTime: string;
  location?: string;
  isOnline?: boolean;
  students?: number;
  color: string;
}

interface DaySchedule {
  date: Date;
  dayName: string;
  events: ScheduleEvent[];
}

const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'];

export function Schedule() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.teacherClasses.getAll()
      .then((res) => {
        const list = (res.data?.data ?? []) as any[];
        const arr = Array.isArray(list) ? list : [];
        const events: ScheduleEvent[] = arr.map((c: any, i: number) => {
          const start = c.startDate ? new Date(c.startDate) : new Date();
          const end = c.endDate ? new Date(c.endDate) : new Date(start.getTime() + 90 * 60000);
          const ev: ScheduleEvent & { startDate?: string } = {
            id: String(c.id),
            title: c.name || `Lớp ${c.id}`,
            classId: String(c.id),
            className: c.name || '',
            type: 'class',
            startTime: start.toTimeString().slice(0, 5),
            endTime: end.toTimeString().slice(0, 5),
            students: c.studentCount ?? 0,
            color: COLORS[i % COLORS.length],
          };
          if (c.startDate) (ev as any).startDate = c.startDate;
          return ev;
        });
        setAllEvents(events);
      })
      .catch(() => {
        toast.error('Không tải được lịch lớp');
        setAllEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getEventsForDate = (date: Date): ScheduleEvent[] => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    return allEvents.filter((ev) => {
      const raw = (ev as any).startDate;
      if (!raw) return false;
      const startDate = new Date(raw);
      return startDate.getFullYear() === y && startDate.getMonth() === m && startDate.getDate() === d;
    });
  };

  const getWeekDates = (date: Date): DaySchedule[] => {
    const week: DaySchedule[] = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      week.push({
        date: currentDay,
        dayName: currentDay.toLocaleDateString('vi-VN', { weekday: 'short' }),
        events: getEventsForDate(currentDay),
      });
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    toast.info('Add Schedule Event - Coming soon!');
  };

  const getMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const totalClasses = weekDates.reduce(
    (sum, day) => sum + day.events.filter((e) => e.type === 'class').length,
    0
  );
  const totalHours = weekDates.reduce((sum, day) => {
    return (
      sum +
      day.events.reduce((eventSum, event) => {
        const [startHour, startMin] = event.startTime.split(':').map(Number);
        const [endHour, endMin] = event.endTime.split(':').map(Number);
        const duration = endHour * 60 + endMin - (startHour * 60 + startMin);
        return eventSum + duration / 60;
      }, 0)
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-500 to-pink-700 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Schedule Management</h1>
                <p className="text-pink-50">Manage your teaching schedule</p>
              </div>
            </div>
            <Button
              onClick={handleAddEvent}
              className="bg-white text-pink-600 hover:bg-pink-50 gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Add Event</span>
              <span className="md:hidden">Add</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-pink-200" />
                <div>
                  <div className="text-2xl font-bold">{totalClasses}</div>
                  <div className="text-sm text-pink-50">Classes This Week</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-300" />
                <div>
                  <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                  <div className="text-sm text-pink-50">Teaching Hours</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-300" />
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-pink-50">Active Classes</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Video className="h-8 w-8 text-purple-300" />
                <div>
                  <div className="text-2xl font-bold">
                    {weekDates.reduce(
                      (sum, day) => sum + day.events.filter((e) => e.isOnline).length,
                      0
                    )}
                  </div>
                  <div className="text-sm text-pink-50">Online Sessions</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Calendar Controls */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handlePreviousWeek} variant="outline" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center min-w-[200px]">
                <h2 className="text-xl font-bold">{getMonthYear()}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Week of {weekDates[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <Button onClick={handleNextWeek} variant="outline" size="icon">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleToday} variant="outline">
                Today
              </Button>
            </div>
          </div>
        </Card>

        {/* Week View */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((day, index) => {
            const isToday =
              day.date.toDateString() === new Date().toDateString();
            return (
              <Card
                key={index}
                className={`${
                  isToday
                    ? 'ring-2 ring-pink-500 dark:ring-pink-400'
                    : ''
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-3 border-b ${
                    isToday
                      ? 'bg-pink-50 dark:bg-pink-900/20'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {day.dayName}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        isToday
                          ? 'text-pink-600 dark:text-pink-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {day.date.getDate()}
                    </div>
                  </div>
                </div>

                {/* Events */}
                <div className="p-3 space-y-2 min-h-[300px]">
                  {day.events.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No events
                    </div>
                  ) : (
                    day.events.map((event) => (
                      <div
                        key={event.id}
                        className={`${event.color} text-white p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
                        onClick={() => toast.info(`View ${event.title}`)}
                      >
                        <div className="font-semibold text-sm mb-1">
                          {event.title}
                        </div>
                        <div className="flex items-center gap-1 text-xs mb-2">
                          <Clock className="h-3 w-3" />
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {event.isOnline ? (
                            <Badge className="bg-white/20 text-white text-xs">
                              <Video className="h-3 w-3 mr-1" />
                              Online
                            </Badge>
                          ) : event.location ? (
                            <Badge className="bg-white/20 text-white text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </Badge>
                          ) : null}
                          {event.students && (
                            <Badge className="bg-white/20 text-white text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {event.students}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Legend */}
        <Card className="p-4 mt-6">
          <h3 className="font-semibold mb-3">Event Types</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Classes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded"></div>
              <span className="text-sm">Events</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

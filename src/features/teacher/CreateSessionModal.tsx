import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSessionModal({ open, onOpenChange, onSuccess }: CreateSessionModalProps) {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    duration: '60',
    maxStudents: '20',
    lessons: [] as string[],
  });

  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);

  const availableLessons = [
    { id: '1', title: 'Introduction to Greetings', type: 'Video' },
    { id: '2', title: 'Restaurant Vocabulary', type: 'Flashcard' },
    { id: '3', title: 'Pronunciation Practice', type: 'Pronunciation' },
    { id: '4', title: 'Hotel Booking Conversation', type: 'AI Chat' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.level || !date || selectedLessons.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Session created successfully! 🎉');
    onOpenChange(false);
    onSuccess?.();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      level: '',
      duration: '60',
      maxStudents: '20',
      lessons: [],
    });
    setSelectedLessons([]);
    setDate(undefined);
  };

  const addLesson = (lessonId: string) => {
    if (!selectedLessons.includes(lessonId)) {
      setSelectedLessons([...selectedLessons, lessonId]);
    }
  };

  const removeLesson = (lessonId: string) => {
    setSelectedLessons(selectedLessons.filter(id => id !== lessonId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new learning session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Beginner English - Week 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this session..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  min="15"
                  max="180"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Lessons Selection */}
          <div className="space-y-4">
            <Label>Add Lessons *</Label>
            
            {/* Available Lessons */}
            <div className="border rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium mb-2">Available Lessons:</p>
              <div className="space-y-2">
                {availableLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lesson.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded">
                        {lesson.type}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => addLesson(lesson.id)}
                      disabled={selectedLessons.includes(lesson.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Lessons */}
            {selectedLessons.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm font-medium mb-2">Selected Lessons ({selectedLessons.length}):</p>
                <div className="space-y-2">
                  {selectedLessons.map((lessonId, index) => {
                    const lesson = availableLessons.find(l => l.id === lessonId);
                    return lesson ? (
                      <div
                        key={lessonId}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            {index + 1}.
                          </span>
                          <span className="text-sm">{lesson.title}</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded">
                            {lesson.type}
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLesson(lessonId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              Create Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
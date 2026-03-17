import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { CalendarIcon, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AssignContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'lesson' | 'test' | 'session';
  contentId?: string;
  onSuccess?: () => void;
}

export function AssignContentModal({ 
  open, 
  onOpenChange, 
  contentType,
  contentId,
  onSuccess 
}: AssignContentModalProps) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date>();
  const [assignTo, setAssignTo] = useState<'classes' | 'students'>('classes');

  const classes = [
    { id: '1', name: 'Beginner A1', students: 25 },
    { id: '2', name: 'Intermediate B1', students: 18 },
    { id: '3', name: 'Advanced C1', students: 12 },
  ];

  const students = [
    { id: '1', name: 'John Smith', email: 'john@email.com', class: 'Beginner A1' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@email.com', class: 'Beginner A1' },
    { id: '3', name: 'Mike Brown', email: 'mike@email.com', class: 'Intermediate B1' },
    { id: '4', name: 'Emily Davis', email: 'emily@email.com', class: 'Intermediate B1' },
    { id: '5', name: 'David Wilson', email: 'david@email.com', class: 'Advanced C1' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (assignTo === 'classes' && selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }
    
    if (assignTo === 'students' && selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    const count = assignTo === 'classes' 
      ? selectedClasses.reduce((sum, classId) => {
          const cls = classes.find(c => c.id === classId);
          return sum + (cls?.students || 0);
        }, 0)
      : selectedStudents.length;

    toast.success(
      `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} assigned to ${count} student${count > 1 ? 's' : ''} successfully! 🎉`
    );
    
    onOpenChange(false);
    onSuccess?.();
    resetForm();
  };

  const resetForm = () => {
    setSelectedClasses([]);
    setSelectedStudents([]);
    setDueDate(undefined);
    setAssignTo('classes');
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Assign {contentType === 'session' ? 'Session' : contentType === 'lesson' ? 'Lesson' : 'Test'} to Class
          </DialogTitle>
          <DialogDescription>
            Select a class and set the deadline for this assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assign To Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={assignTo === 'classes' ? 'default' : 'outline'}
              onClick={() => setAssignTo('classes')}
              className="flex-1 gap-2"
            >
              <Users className="w-4 h-4" />
              Assign to Classes
            </Button>
            <Button
              type="button"
              variant={assignTo === 'students' ? 'default' : 'outline'}
              onClick={() => setAssignTo('students')}
              className="flex-1 gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Assign to Students
            </Button>
          </div>

          {/* Classes Selection */}
          {assignTo === 'classes' && (
            <div className="space-y-3">
              <Label>Select Classes</Label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Checkbox
                      id={`class-${cls.id}`}
                      checked={selectedClasses.includes(cls.id)}
                      onCheckedChange={() => toggleClass(cls.id)}
                    />
                    <label
                      htmlFor={`class-${cls.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-gray-500">
                        {cls.students} students
                      </p>
                    </label>
                  </div>
                ))}
              </div>
              {selectedClasses.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {selectedClasses.reduce((sum, classId) => {
                    const cls = classes.find(c => c.id === classId);
                    return sum + (cls?.students || 0);
                  }, 0)} students will receive this {contentType}
                </p>
              )}
            </div>
          )}

          {/* Students Selection */}
          {assignTo === 'students' && (
            <div className="space-y-3">
              <Label>Select Students</Label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <label
                      htmlFor={`student-${student.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">
                        {student.email} • {student.class}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
              {selectedStudents.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : <span>Pick a due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Assignment Summary:</h4>
            <ul className="space-y-1 text-sm">
              <li>
                • Content Type: <strong>{contentType.charAt(0).toUpperCase() + contentType.slice(1)}</strong>
              </li>
              <li>
                • Assigned to: <strong>
                  {assignTo === 'classes' 
                    ? `${selectedClasses.length} class${selectedClasses.length !== 1 ? 'es' : ''}`
                    : `${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''}`
                  }
                </strong>
              </li>
              {dueDate && (
                <li>
                  • Due Date: <strong>{format(dueDate, 'PPP')}</strong>
                </li>
              )}
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={
                (assignTo === 'classes' && selectedClasses.length === 0) ||
                (assignTo === 'students' && selectedStudents.length === 0)
              }
            >
              Assign {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
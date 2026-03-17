import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Plus, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface TestQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  points: number;
}

export function CreateTestModal({ open, onOpenChange, onSuccess }: CreateTestModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    duration: '30',
    passingScore: '70',
  });

  const [questions, setQuestions] = useState<TestQuestion[]>([
    {
      id: '1',
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.level || questions.length === 0) {
      toast.error('Please fill in all required fields and add at least one question');
      return;
    }

    const emptyQuestions = questions.filter(q => !q.question.trim());
    if (emptyQuestions.length > 0) {
      toast.error('Please fill in all question fields');
      return;
    }

    toast.success('Test created successfully! 🎉');
    onOpenChange(false);
    onSuccess?.();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: '',
      duration: '30',
      passingScore: '70',
    });
    setQuestions([
      {
        id: '1',
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10,
      },
    ]);
  };

  const addQuestion = (type: TestQuestion['type']) => {
    const newQuestion: TestQuestion = {
      id: Date.now().toString(),
      type,
      question: '',
      correctAnswer: type === 'multiple-choice' ? 0 : '',
      points: 10,
    };

    if (type === 'multiple-choice') {
      newQuestion.options = ['', '', '', ''];
    } else if (type === 'true-false') {
      newQuestion.options = ['True', 'False'];
      newQuestion.correctAnswer = 0;
    }

    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      toast.error('Test must have at least one question');
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof TestQuestion, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Test</DialogTitle>
          <DialogDescription>
            Create a comprehensive test to assess your students' progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Week 1 Assessment"
                  required
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the test..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  min="10"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                  min="50"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Questions ({questions.length})</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addQuestion('multiple-choice')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Multiple Choice
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addQuestion('true-false')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  True/False
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addQuestion('fill-blank')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Fill Blank
                </Button>
              </div>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 mt-2" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">
                            Question {idx + 1}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Select
                              value={q.type}
                              onValueChange={(value) => updateQuestion(q.id, 'type', value)}
                            >
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                <SelectItem value="true-false">True/False</SelectItem>
                                <SelectItem value="fill-blank">Fill Blank</SelectItem>
                                <SelectItem value="short-answer">Short Answer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              value={q.points}
                              onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value))}
                              className="w-20 h-8 text-xs"
                              min="1"
                              max="100"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeQuestion(q.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                          placeholder="Enter your question here..."
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Multiple Choice Options */}
                    {q.type === 'multiple-choice' && q.options && (
                      <div className="space-y-2 pl-6">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Options (select correct answer)
                        </Label>
                        <RadioGroup
                          value={q.correctAnswer.toString()}
                          onValueChange={(v) => updateQuestion(q.id, 'correctAnswer', parseInt(v))}
                        >
                          <div className="space-y-2">
                            {q.options.map((option, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <RadioGroupItem value={optIdx.toString()} id={`${q.id}-opt-${optIdx}`} />
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...q.options!];
                                    newOptions[optIdx] = e.target.value;
                                    updateQuestion(q.id, 'options', newOptions);
                                  }}
                                  placeholder={`Option ${optIdx + 1}`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* True/False */}
                    {q.type === 'true-false' && (
                      <div className="space-y-2 pl-6">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Correct Answer
                        </Label>
                        <RadioGroup
                          value={q.correctAnswer.toString()}
                          onValueChange={(v) => updateQuestion(q.id, 'correctAnswer', parseInt(v))}
                        >
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="0" id={`${q.id}-true`} />
                              <Label htmlFor={`${q.id}-true`}>True</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="1" id={`${q.id}-false`} />
                              <Label htmlFor={`${q.id}-false`}>False</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* Fill in the Blank */}
                    {q.type === 'fill-blank' && (
                      <div className="space-y-2 pl-6">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Correct Answer
                        </Label>
                        <Input
                          value={q.correctAnswer as string}
                          onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                          placeholder="Enter the correct answer..."
                        />
                      </div>
                    )}

                    {/* Short Answer */}
                    {q.type === 'short-answer' && (
                      <div className="space-y-2 pl-6">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Sample Answer (for grading reference)
                        </Label>
                        <Textarea
                          value={q.correctAnswer as string}
                          onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                          placeholder="Enter a sample answer..."
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {questions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalPoints}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formData.passingScore}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Passing Score</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              Create Test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
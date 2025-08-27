import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { Plus, Zap } from 'lucide-react';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Work' | 'DSA' | 'Personal'>('Work');
  const [xpReward, setXpReward] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      xp_reward: xpReward,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Work');
    setXpReward(10);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Create New Quest</span>
          </DialogTitle>
          <DialogDescription>
            Add a new quest to your journey and start earning XP
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quest Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete React tutorial"
              required
              className="bg-secondary/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your quest..."
              className="bg-secondary/50 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value: 'Work' | 'DSA' | 'Personal') => setCategory(value)}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Work">💼 Work</SelectItem>
                  <SelectItem value="DSA">💻 DSA</SelectItem>
                  <SelectItem value="Personal">👤 Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xp">XP Reward</Label>
              <Select value={xpReward.toString()} onValueChange={(value) => setXpReward(parseInt(value))}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 XP - Quick task</SelectItem>
                  <SelectItem value="10">10 XP - Normal task</SelectItem>
                  <SelectItem value="20">20 XP - Medium task</SelectItem>
                  <SelectItem value="50">50 XP - Large task</SelectItem>
                  <SelectItem value="100">100 XP - Epic quest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-xp" />
              <span>You'll earn {xpReward} XP upon completion</span>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="glow-primary" disabled={!title.trim()}>
                Create Quest
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
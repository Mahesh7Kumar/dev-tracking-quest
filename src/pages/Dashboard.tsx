import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Settings, 
  Zap, 
  Trophy, 
  Flame, 
  Target, 
  Plus,
  CheckCircle2,
  Clock,
  Code,
  Briefcase,
  User
} from 'lucide-react';
import { useState } from 'react';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { stats } = useUserStats();
  const { tasks, pendingTasks, completedTasks, todayTasks, completeTask } = useTasks();
  const [showCreateTask, setShowCreateTask] = useState(false);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const xpToNextLevel = ((stats?.level || 1) * 100) - (stats?.xp || 0);
  const xpProgress = ((stats?.xp || 0) % 100);

  const categoryIcons = {
    Work: Briefcase,
    DSA: Code,
    Personal: User,
  };

  const categoryColors = {
    Work: 'bg-accent',
    DSA: 'bg-primary',
    Personal: 'bg-success',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  DevQuest
                </h1>
              </div>
              <div className="hidden md:block text-muted-foreground">
                {greeting}, {user?.email?.split('@')[0]}!
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search quests..."
                  className="pl-10 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Avatar className="cursor-pointer" onClick={signOut}>
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Zap className="h-4 w-4 text-xp" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-xp">{stats?.xp || 0}</div>
              <p className="text-xs text-muted-foreground">
                {xpToNextLevel} XP to level {(stats?.level || 1) + 1}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.level || 1}</div>
              <Progress value={xpProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
              <Flame className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats?.streak || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.streak === 0 ? 'Complete a quest today!' : 'Keep it up!'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Quests</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{todayTasks.length}</div>
              <p className="text-xs text-muted-foreground">Completed today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Quests */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>Current Quests</span>
                    </CardTitle>
                    <CardDescription>
                      Complete quests to earn XP and level up
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowCreateTask(true)}
                    className="glow-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Quest
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active quests. Create one to start your journey!</p>
                  </div>
                ) : (
                  pendingTasks.map((task) => {
                    const CategoryIcon = categoryIcons[task.category];
                    return (
                      <div key={task.id} className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => completeTask(task.id)}
                          className="border-primary data-[state=checked]:bg-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                            <Badge className={`${categoryColors[task.category]} text-xs`}>
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {task.category}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Zap className="h-4 w-4 text-xp" />
                          <span className="text-xp font-medium">{task.xp_reward}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Streak */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className="p-1 rounded-full bg-success/20">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <div className="text-xs text-xp">+{task.xp_reward}</div>
                  </div>
                ))}
                {completedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No completed quests yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-success" />
                  <span>Streak Tracker</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">
                    {stats?.streak || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {stats?.streak === 0 ? 'Start your streak today!' : 'Days in a row'}
                  </p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full ${
                          i < (stats?.streak || 0) ? 'bg-success' : 'bg-secondary'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
    </div>
  );
}
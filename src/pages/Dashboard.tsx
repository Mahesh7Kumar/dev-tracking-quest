import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useState, useEffect } from 'react';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { stats } = useUserStats();
  const { tasks, pendingTasks, completedTasks, todayTasks, completeTask } = useTasks();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const displayTasks = searchTerm.trim() ? searchResults : pendingTasks;

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-background dark:via-background/95 dark:to-primary/5">
      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-card/50 dark:bg-card/30 backdrop-blur-sm sticky top-0 z-50 dark:border-border/20">
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
                {greeting}, {profile.display_name || user?.email?.split('@')[0]}!
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" 
                  onClick={handleSearch}
                />
                <input
                  placeholder="Search quests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10 pr-4 py-2 bg-secondary/50 dark:bg-secondary/30 border border-border/50 dark:border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 text-foreground dark:text-foreground"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-5 w-5" />
              </Button>
              <Avatar className="cursor-pointer w-10 h-10 rounded-full border border-border/50" onClick={signOut}>
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Profile" />
                ) : null}
                <AvatarFallback className="bg-primary/20 text-primary">
                  {(profile.display_name || user?.email)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 dark:bg-gradient-to-br dark:from-card/50 dark:to-xp/10 border-border/50 dark:border-xp/20 hover:bg-card/70 dark:hover:bg-gradient-to-br dark:hover:from-card/60 dark:hover:to-xp/20 transition-all glow-xp dark:shadow-lg dark:shadow-xp/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">Total XP</CardTitle>
              <Zap className="h-4 w-4 text-xp dark:text-xp drop-shadow-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-xp dark:text-xp dark:drop-shadow-sm">{stats?.xp || 0}</div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/80">
                {xpToNextLevel} XP to level {(stats?.level || 1) + 1}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 dark:bg-gradient-to-br dark:from-card/50 dark:to-primary/10 border-border/50 dark:border-primary/20 hover:bg-card/70 dark:hover:bg-gradient-to-br dark:hover:from-card/60 dark:hover:to-primary/20 transition-all glow-primary dark:shadow-lg dark:shadow-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">Current Level</CardTitle>
              <Trophy className="h-4 w-4 text-primary dark:text-primary drop-shadow-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary dark:text-primary dark:drop-shadow-sm">{stats?.level || 1}</div>
              <Progress value={xpProgress} className="mt-2 h-2 dark:bg-secondary/30" />
            </CardContent>
          </Card>

          <Card className="bg-card/50 dark:bg-gradient-to-br dark:from-card/50 dark:to-success/10 border-border/50 dark:border-success/20 hover:bg-card/70 dark:hover:bg-gradient-to-br dark:hover:from-card/60 dark:hover:to-success/20 transition-all glow-success dark:shadow-lg dark:shadow-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">Daily Streak</CardTitle>
              <Flame className="h-4 w-4 text-success dark:text-success drop-shadow-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success dark:text-success dark:drop-shadow-sm">{stats?.streak || 0}</div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/80">
                {stats?.streak === 0 ? 'Complete a quest today!' : 'Keep it up!'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 dark:bg-gradient-to-br dark:from-card/50 dark:to-accent/10 border-border/50 dark:border-accent/20 hover:bg-card/70 dark:hover:bg-gradient-to-br dark:hover:from-card/60 dark:hover:to-accent/20 transition-all glow-accent dark:shadow-lg dark:shadow-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-foreground">Today's Quests</CardTitle>
              <Target className="h-4 w-4 text-accent dark:text-accent drop-shadow-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent dark:text-accent dark:drop-shadow-sm">{todayTasks.length}</div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/80">Completed today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Quests */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 dark:bg-card/30 dark:backdrop-blur-sm border-border/50 dark:border-border/20 dark:shadow-xl dark:shadow-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center space-x-2 dark:text-foreground">
                      <Target className="h-5 w-5 text-primary dark:text-primary drop-shadow-sm" />
                      <span>{searchTerm.trim() ? `Search Results${isSearching ? ' (Searching...)' : ''}` : 'Current Quests'}</span>
                    </CardTitle>
                    <CardDescription className="dark:text-muted-foreground/80">
                      {searchTerm.trim() ? `Showing results for "${searchTerm}"` : 'Complete quests to earn XP and level up'}
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {/* Desktop: Full button with text */}
                    <Button 
                      onClick={() => setShowCreateTask(true)}
                      className="hidden sm:inline-flex glow-primary dark:bg-primary dark:hover:bg-primary/90 dark:shadow-lg dark:shadow-primary/30"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Quest
                    </Button>
                    {/* Mobile: Circular icon-only button */}
                    <Button 
                      onClick={() => setShowCreateTask(true)}
                      size="icon"
                      className="sm:hidden glow-primary dark:bg-primary dark:hover:bg-primary/90 dark:shadow-lg dark:shadow-primary/30 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{searchTerm.trim() ? 'No quests found matching your search.' : 'No active quests. Create one to start your journey!'}</p>
                  </div>
                ) : (
                  displayTasks.map((task) => {
                    const CategoryIcon = categoryIcons[task.category];
                    return (
                      <div key={task.id} className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/30 dark:bg-secondary/20 dark:border dark:border-border/20 hover:bg-secondary/50 dark:hover:bg-secondary/30 dark:hover:border-border/30 transition-all dark:shadow-md">
                        <Checkbox
                          checked={task.status === 'completed'}
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
            <Card className="bg-card/50 dark:bg-card/30 dark:backdrop-blur-sm border-border/50 dark:border-border/20 dark:shadow-xl dark:shadow-success/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success dark:text-success drop-shadow-sm" />
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

            <Card className="bg-card/50 dark:bg-card/30 dark:backdrop-blur-sm border-border/50 dark:border-border/20 dark:shadow-xl dark:shadow-success/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-foreground">
                  <Flame className="h-5 w-5 text-success dark:text-success drop-shadow-sm" />
                  <span>Streak Tracker</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success dark:text-success dark:drop-shadow-sm mb-2">
                    {stats?.streak || 0}
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mb-4">
                    {stats?.streak === 0 ? 'Start your streak today!' : 'Days in a row'}
                  </p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full transition-all ${
                          i < (stats?.streak || 0) 
                            ? 'bg-success dark:bg-success dark:shadow-md dark:shadow-success/50' 
                            : 'bg-secondary dark:bg-secondary/30 dark:border dark:border-border/20'
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
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
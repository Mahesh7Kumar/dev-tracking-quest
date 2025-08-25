import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Trophy, Target, Flame } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="p-4 rounded-full bg-primary/20 glow-primary">
              <Zap className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
              DevQuest
            </h1>
          </div>
          
          <p className="text-2xl text-muted-foreground mb-12 leading-relaxed">
            Level up your coding journey with gamified task management. 
            <br />
            Earn XP, unlock achievements, and build streaks!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 rounded-lg bg-card/50 border border-border/50 glass">
              <div className="p-3 rounded-full bg-xp/20 w-fit mx-auto mb-4">
                <Trophy className="h-8 w-8 text-xp" />
              </div>
              <h3 className="text-xl font-bold mb-2">Earn XP & Level Up</h3>
              <p className="text-muted-foreground">
                Complete coding tasks and projects to gain experience points and advance through levels
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 border border-border/50 glass">
              <div className="p-3 rounded-full bg-success/20 w-fit mx-auto mb-4">
                <Flame className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Build Streaks</h3>
              <p className="text-muted-foreground">
                Maintain daily coding habits and watch your streak grow to unlock special rewards
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 border border-border/50 glass">
              <div className="p-3 rounded-full bg-accent/20 w-fit mx-auto mb-4">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Organize tasks by categories and monitor your development journey with detailed analytics
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 glow-primary">
                Start Your Quest
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Join thousands of developers leveling up their skills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

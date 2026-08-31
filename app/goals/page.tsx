import { getGoals } from '@/app/actions/goals';
import { requireVerifiedUser } from '@/lib/auth';
import { NavSlide } from '@/components/sidenav';

export const metadata = { title: 'Financial Goals', description: 'Set financial goals and track the savings needed to reach them.' };
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoalFormModal from './goal-form-modal';
import { CheckCircle2, Flag, Target, TrendingUp } from 'lucide-react';

const GOAL_EMOJI: Record<string, string> = {
  'Emergency Fund': '🛡️',
  'Vacation': '✈️',
  'Home': '🏠',
  'Vehicle': '🚗',
  'Education': '🎓',
  'Wedding': '💍',
  'Retirement': '🌅',
  'Investment': '📈',
  'Gadget': '💻',
  'Other': '🎯',
};

export default async function GoalsPage() {
  await requireVerifiedUser();
  const { goals, totalTargetAmount, totalCurrentAmount, completedGoalsCount } = await getGoals();

  const overallProgress =
    totalTargetAmount > 0 ? Math.min(100, (totalCurrentAmount / totalTargetAmount) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <NavSlide />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden pb-24 lg:pb-6 pt-16 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Set savings targets, track your progress, and stay motivated to reach your milestones.
            </p>
          </div>
          <GoalFormModal />
        </div>

        {/* Summary */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-xs border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/30 dark:bg-emerald-950/20">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Saved</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                ₹{totalCurrentAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Across all goals</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Total Target</span>
                <Target className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                ₹{totalTargetAmount.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Combined goal amounts</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Goals Completed</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {completedGoalsCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">of {goals.length} total goals</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xs">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Overall Progress</span>
                <Flag className="h-4 w-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {overallProgress.toFixed(1)}%
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {goals.length ? (
            goals.map((goal) => {
              const isComplete = goal.progressPercentage >= 100 || goal.status === 'COMPLETED';
              const isOverdue = new Date(goal.targetDate) < new Date() && !isComplete;

              return (
                <Card key={goal.id} className={`rounded-2xl shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all ${isComplete ? 'border-emerald-200 dark:border-emerald-900' : isOverdue ? 'border-red-200 dark:border-red-900' : ''}`}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{GOAL_EMOJI[goal.category] ?? '🎯'}</span>
                        <CardTitle className="text-base font-bold">{goal.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          {goal.category}
                        </span>
                        {isComplete && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 font-semibold">
                            Completed!
                          </span>
                        )}
                        {isOverdue && !isComplete && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 border border-red-200 font-semibold">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <GoalFormModal goal={goal} />
                  </CardHeader>

                  <CardContent className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/40 rounded-xl">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Saved</p>
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{goal.currentAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          ₹{goal.targetAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Progress</span>
                        <span className={isComplete ? 'text-emerald-600 font-bold' : 'text-foreground'}>
                          {goal.progressPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <span>
                        By {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                      {!isComplete && (
                        <span className="font-medium">
                          ≈ ₹{Math.round(goal.requiredMonthlySavings).toLocaleString('en-IN')}/mo needed
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl border bg-muted/30 p-12 text-center space-y-3">
              <Target className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <div>
                <p className="font-semibold text-base text-foreground">No financial goals set yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Create goals for an emergency fund, vacation, home purchase, or any savings milestone.
                </p>
              </div>
              <div className="pt-2">
                <GoalFormModal />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


import React, { useState } from 'react';
import { SpiritualMilestone } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { SAMPLE_MILESTONES } from '../services/MockDb';
import { CheckCircleIcon, ArrowPathIcon, SparklesIcon, BookOpenIcon, LightBulbIcon, ClockIcon, ShieldCheckIcon, HeartIcon } from './common/IconComponents';
import { triggerHapticFeedback } from '../utils/haptics';

const iconMap: { [key: string]: React.ElementType } = {
  BookOpenIcon: BookOpenIcon,
  SparklesIcon: SparklesIcon,
  ArrowPathIcon: ArrowPathIcon,
  CheckCircleIcon: CheckCircleIcon,
  ShieldCheckIcon: ShieldCheckIcon,
  HeartIcon: HeartIcon,
  Default: SparklesIcon,
};

const SpiritualGrowthTracker: React.FC = () => {
  const [milestones] = useState<SpiritualMilestone[]>(SAMPLE_MILESTONES);
  // Example data for new sections
  const [weeklyInsights, setWeeklyInsights] = useState<string | null>(null);
  const [commonThemes, setCommonThemes] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);

  const getIconComponent = (iconName?: string, defaultIconColor: string = 'text-brand-accent'): React.ReactNode => {
    const Icon = iconName && iconMap[iconName] ? iconMap[iconName] : iconMap.Default;
    return <Icon className={`w-6 h-6 ${defaultIconColor}`} />;
  };
  
  const completedMilestones = milestones.filter(m => m.achievedDate || m.progress === 100);
  const inProgressMilestones = milestones.filter(m => !m.achievedDate && m.progress && m.progress < 100 && m.progress > 0);
  const upcomingMilestones = milestones.filter(m => !m.achievedDate && (m.progress === 0 || !m.progress));

  const handleGetSampleInsights = (type: 'weekly' | 'themes') => {
    triggerHapticFeedback();
    setIsLoadingInsights(true);
    setWeeklyInsights(null);
    setCommonThemes(null);
    setTimeout(() => {
      if (type === 'weekly') {
        setWeeklyInsights("Sample Weekly Resilience Insight: This week, your reflections show growing trust in God's plan. Your engagement with challenging passages indicates an increasing desire to understand deeper truths. Consider how current events are shaping your faith and peace.");
      } else if (type === 'themes') {
        setCommonThemes("Sample Common Themes in Resilience: Recurring themes in your journey towards resilience include 'Finding peace amidst chaos', 'Strengthening faith through trials', and 'The power of communal love and support'. These are rich areas for continued prayer and study.");
      }
      setIsLoadingInsights(false);
    }, 1200);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <ArrowPathIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">Spiritual Growth Tracker</h1>
      </div>
      <p className="text-brand-text-secondary text-base">Celebrate your progress and see your next steps.</p>

      <Card title="My Growth Summary" className="bg-brand-primary/5" titleClassName="font-display text-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center py-4">
          <div>
            <p className="text-4xl font-bold text-brand-primary">{completedMilestones.length}</p>
            <p className="text-brand-text-secondary mt-1">Milestones Achieved</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-brand-primary">{inProgressMilestones.length}</p>
            <p className="text-brand-text-secondary mt-1">Currently Pursuing</p>
          </div>
           <div>
            <p className="text-4xl font-bold text-brand-primary">1250</p>
            <p className="text-brand-text-secondary mt-1">Growth Points (Example)</p>
          </div>
        </div>
      </Card>

      <Card title="Spiritual Resilience Details" titleClassName="font-display text-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-4">
          <div className="p-3 bg-brand-surface border border-brand-primary/10 rounded-lg shadow-sm">
            <SparklesIcon className="w-8 h-8 text-brand-accent mx-auto mb-1" />
            <p className="text-xl font-semibold text-brand-primary">85<span className="text-sm">/100</span></p>
            <p className="text-sm text-brand-text-secondary">Faith</p>
          </div>
          <div className="p-3 bg-brand-surface border border-brand-primary/10 rounded-lg shadow-sm">
            <CheckCircleIcon className="w-8 h-8 text-brand-accent mx-auto mb-1" />
            <p className="text-xl font-semibold text-brand-primary">70<span className="text-sm">/100</span></p>
            <p className="text-sm text-brand-text-secondary">Peace</p>
          </div>
          <div className="p-3 bg-brand-surface border border-brand-primary/10 rounded-lg shadow-sm">
            <HeartIcon className="w-8 h-8 text-brand-accent mx-auto mb-1" />
            <p className="text-xl font-semibold text-brand-primary">80<span className="text-sm">/100</span></p>
            <p className="text-sm text-brand-text-secondary">Love</p>
          </div>
          <div className="p-3 bg-brand-surface border border-brand-primary/10 rounded-lg shadow-sm">
            <ShieldCheckIcon className="w-8 h-8 text-brand-accent mx-auto mb-1" />
            <p className="text-xl font-semibold text-brand-primary">75<span className="text-sm">/100</span></p>
            <p className="text-sm text-brand-text-secondary">Trust</p>
          </div>
        </div>
        <p className="text-center text-brand-text-secondary text-sm italic">
          Overall Trend: Steadily Improving 🌱 (Example data)
        </p>
        <div className="mt-4 pt-4 border-t border-brand-primary/10">
            <h4 className="text-md font-semibold text-brand-primary mb-2">Personalized Growth Areas (AI Suggested - Example):</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-brand-text-secondary">
                <li><span className="font-medium text-green-600">Strength:</span> Consistent reflection on gratitude in your journal entries.</li>
                <li><span className="font-medium text-blue-600">Area for Growth:</span> Exploring patience and understanding in daily interactions, perhaps through targeted scripture study.</li>
                 <li><span className="font-medium text-yellow-600">Consider:</span> How current life events are shaping your understanding of God's sovereignty.</li>
            </ul>
        </div>
      </Card>
      
      <Card title="AI-Powered Insights (Example)" titleClassName="font-display text-xl">
        <div className="space-y-4">
          <div className="p-3 bg-brand-accent/10 rounded-lg">
            <h3 className="font-semibold text-brand-primary mb-1">Weekly Resilience Insight</h3>
            {weeklyInsights && <p className="text-sm text-brand-text-secondary mb-2">{weeklyInsights}</p>}
            <Button onClick={() => handleGetSampleInsights('weekly')} size="sm" variant="outline" leftIcon={<LightBulbIcon className="w-4 h-4" />} isLoading={isLoadingInsights && !commonThemes}>
              {weeklyInsights ? "Refresh Weekly Insight" : "Get Weekly Insight"}
            </Button>
          </div>
          <div className="p-3 bg-brand-accent/10 rounded-lg">
            <h3 className="font-semibold text-brand-primary mb-1">Common Resilience Themes</h3>
             {commonThemes && <p className="text-sm text-brand-text-secondary mb-2">{commonThemes}</p>}
            <Button onClick={() => handleGetSampleInsights('themes')} size="sm" variant="outline" leftIcon={<LightBulbIcon className="w-4 h-4" />} isLoading={isLoadingInsights && !weeklyInsights}>
              {commonThemes ? "Refresh Common Themes" : "Discover Common Themes"}
            </Button>
          </div>
          {isLoadingInsights && (
            <div className="text-sm text-brand-text-secondary flex items-center justify-center py-2">
              <ClockIcon className="w-4 h-4 mr-1 animate-spin" /> Generating insights...
            </div>
          )}
        </div>
      </Card>

      <Card title="Activity Streaks (Example)" titleClassName="font-display text-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-brand-surface border border-brand-primary/20 rounded-lg text-center shadow-sm">
                <SparklesIcon className="w-8 h-8 text-brand-accent mx-auto mb-1" />
                <p className="text-2xl font-semibold text-brand-primary">7 Days</p>
                <p className="text-sm text-brand-text-secondary">Prayer Streak</p>
            </div>
            <div className="p-3 bg-brand-surface border border-brand-primary/20 rounded-lg text-center shadow-sm">
                <BookOpenIcon className="w-8 h-8 text-brand-accent mx-auto mb-1" />
                <p className="text-2xl font-semibold text-brand-primary">3 Days</p>
                <p className="text-sm text-brand-text-secondary">Journaling Streak</p>
            </div>
             <div className="p-3 bg-brand-surface border border-brand-primary/20 rounded-lg text-center shadow-sm">
                <CheckCircleIcon className="w-8 h-8 text-brand-accent mx-auto mb-1" />
                <p className="text-2xl font-semibold text-brand-primary">5 Tasks</p>
                <p className="text-sm text-brand-text-secondary">Planner Tasks This Week</p>
            </div>
        </div>
      </Card>


      {completedMilestones.length > 0 && (
        <Card title="Achieved Milestones" titleClassName="font-display text-xl text-green-700">
          <div className="space-y-3">
            {completedMilestones.map(milestone => (
              <div key={milestone.id} className="flex items-start p-3 bg-green-500/10 rounded-lg shadow-sm border-l-4 border-green-500">
                <div className="mr-4 mt-1 p-2 bg-green-500/20 rounded-full flex-shrink-0">{getIconComponent(milestone.iconName || 'CheckCircleIcon', 'text-green-600')}</div>
                <div>
                  <h3 className="font-semibold text-green-700 text-base">{milestone.title}</h3>
                  <p className="text-sm text-green-600">{milestone.description}</p>
                  {milestone.achievedDate && <p className="text-xs text-brand-text-secondary mt-0.5">Achieved: {milestone.achievedDate.toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {inProgressMilestones.length > 0 && (
        <Card title="In Progress" titleClassName="font-display text-xl text-brand-primary">
          <div className="space-y-4">
            {inProgressMilestones.map(milestone => (
              <div key={milestone.id} className="p-4 bg-brand-primary/5 rounded-lg shadow-sm border-l-4 border-brand-primary">
                 <div className="flex items-start mb-2">
                    <div className="mr-4 mt-1 p-2 bg-brand-primary/10 rounded-full flex-shrink-0">{getIconComponent(milestone.iconName || 'ArrowPathIcon', 'text-brand-primary')}</div>
                    <div>
                        <h3 className="font-semibold text-brand-primary text-base">{milestone.title}</h3>
                        <p className="text-sm text-brand-text-secondary">{milestone.description}</p>
                    </div>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-brand-accent h-2.5 rounded-full" style={{width: `${milestone.progress || 0}%`}}></div>
                 </div>
                 <p className="text-xs text-right text-brand-text-secondary mt-1">{milestone.progress || 0}% complete</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {upcomingMilestones.length > 0 && (
         <Card title="Next Steps & Suggested Goals" titleClassName="font-display text-xl text-brand-text-primary">
          <div className="space-y-3">
            {upcomingMilestones.map(milestone => (
              <div key={milestone.id} className="flex items-start p-3 bg-brand-surface rounded-lg shadow-sm border-l-4 border-brand-text-secondary/50">
                <div className="mr-4 mt-1 p-2 bg-gray-200 rounded-full flex-shrink-0">{getIconComponent(milestone.iconName || 'SparklesIcon', 'text-brand-text-secondary')}</div>
                <div>
                  <h3 className="font-semibold text-brand-text-primary text-base">{milestone.title}</h3>
                  <p className="text-sm text-brand-text-secondary">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SpiritualGrowthTracker;

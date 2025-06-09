
import React from 'react';
import { UserProfile } from '../types';
import Card from './common/Card';
import { BookOpenIcon, HeartIcon, UsersIcon, AcademicCapIcon, ChartBarIcon, IconProps } from './common/IconComponents'; // Added IconProps

interface GrowthInfographicProps {
  userProfile: UserProfile | null; // For future personalization, not used yet for example data
}

interface GrowthMetric {
  id: string;
  label: string;
  progress: number; // 0-100
  icon: React.ReactElement<IconProps>; // Explicitly type icon with IconProps
  colorClass: string; // Tailwind color class for the progress bar
}

const GrowthInfographic: React.FC<GrowthInfographicProps> = ({ userProfile }) => {
  // Example data for the infographic
  const growthMetrics: GrowthMetric[] = [
    { id: 'knowledge', label: 'Bible Knowledge', progress: 70, icon: <BookOpenIcon className="w-6 h-6 text-blue-600" />, colorClass: 'bg-blue-500' },
    { id: 'prayer', label: 'Prayer Consistency', progress: 85, icon: <HeartIcon className="w-6 h-6 text-pink-600" />, colorClass: 'bg-pink-500' },
    { id: 'community', label: 'Community Engagement', progress: 60, icon: <UsersIcon className="w-6 h-6 text-green-600" />, colorClass: 'bg-green-500' },
    { id: 'understanding', label: 'Theological Understanding', progress: 75, icon: <AcademicCapIcon className="w-6 h-6 text-purple-600" />, colorClass: 'bg-purple-500' },
  ];

  return (
    <Card title="Your Spiritual Growth Snapshot" titleClassName="font-display text-2xl flex items-center">
      <div className="flex items-center text-brand-primary mb-1">
        <ChartBarIcon className="w-6 h-6 mr-2 text-brand-accent" />
        <h3 className="text-xl font-semibold">At a Glance</h3>
      </div>
      <p className="text-sm text-brand-text-secondary mb-6">
        Here's a look at your progress in key spiritual areas. Keep growing!
      </p>
      <div className="space-y-5">
        {growthMetrics.map((metric) => (
          <div key={metric.id}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                {React.cloneElement(metric.icon, { 
                  className: [metric.icon.props.className, "mr-2.5", "flex-shrink-0"].filter(Boolean).join(" ") 
                })}
                <span className="text-base font-medium text-brand-text-primary">{metric.label}</span>
              </div>
              <span className="text-sm font-semibold text-brand-primary">{metric.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3.5 dark:bg-gray-700">
              <div 
                className={`${metric.colorClass} h-3.5 rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${metric.progress}%` }}
                role="progressbar"
                aria-valuenow={metric.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${metric.label} progress`}
              ></div>
            </div>
          </div>
        ))}
      </div>
       <p className="text-xs text-brand-text-secondary mt-6 text-center italic">
        Note: This is a simplified example representation of your growth journey.
      </p>
    </Card>
  );
};

export default GrowthInfographic;

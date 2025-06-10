
import React, { useMemo } from 'react';
import { UserProfile, Interpretation } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { AcademicCapIcon, BookOpenIcon, SparklesIcon, TrashIcon } from './common/IconComponents';
import BibleStudyProgressInfographic from './BibleStudyProgressInfographic'; // New component
import { triggerHapticFeedback } from '../utils/haptics';
import { Link } from 'react-router-dom';

interface LibraryPageProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (updatedSettings: Partial<UserProfile>) => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ userProfile, onUpdateProfile }) => {

  const readChapters = useMemo(() => userProfile?.readChapters || [], [userProfile?.readChapters]);
  const savedInterpretations = useMemo(() => userProfile?.savedInterpretations || [], [userProfile?.savedInterpretations]);

  const handleRemoveReadChapter = (chapterRef: string) => {
    if (!userProfile) return;
    triggerHapticFeedback('light');
    if (window.confirm(`Are you sure you want to remove "${chapterRef}" from your read chapters?`)) {
      const updatedReadChapters = (userProfile.readChapters || []).filter(ch => ch !== chapterRef);
      onUpdateProfile({ readChapters: updatedReadChapters });
    }
  };

  const handleRemoveSavedInterpretation = (interpretationId: string) => {
    if (!userProfile) return;
    triggerHapticFeedback('light');
     if (window.confirm(`Are you sure you want to remove this saved interpretation?`)) {
      const updatedSavedInterpretations = (userProfile.savedInterpretations || []).filter(interp => interp.id !== interpretationId);
      onUpdateProfile({ savedInterpretations: updatedSavedInterpretations });
    }
  };
  
  if (!userProfile) {
    return <div className="text-center py-10">Loading library...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <AcademicCapIcon className="w-10 h-10 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">My Library</h1>
      </div>
      <p className="text-brand-text-secondary text-base">
        Access your read Bible chapters, saved interpretations, and track your study progress.
      </p>

      <Card title="Bible Study Progress" titleClassName="font-display text-2xl">
        <BibleStudyProgressInfographic readChapters={readChapters} />
      </Card>

      <Card title="Read Chapters" titleClassName="font-display text-2xl">
        {readChapters.length === 0 ? (
          <p className="text-brand-text-secondary text-center py-4">
            You haven't marked any chapters as read yet. Visit the <Link to="/interpretations" className="text-brand-primary hover:underline">Interpretation Explorer</Link> to start reading!
          </p>
        ) : (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto p-1">
            {readChapters.map(chapterRef => (
              <div key={chapterRef} className="flex items-center justify-between p-3 bg-brand-primary/5 rounded-md hover:bg-brand-primary/10 transition-colors">
                <span className="text-brand-text-primary flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2 text-brand-primary/70"/>
                  {chapterRef}
                </span>
                <Button 
                    onClick={() => handleRemoveReadChapter(chapterRef)} 
                    variant="ghost" 
                    size="sm" 
                    className="!p-1.5"
                    aria-label={`Remove ${chapterRef} from read chapters`}
                >
                  <TrashIcon className="w-4 h-4 text-red-500/70 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Saved Interpretations" titleClassName="font-display text-2xl">
        {savedInterpretations.length === 0 ? (
          <p className="text-brand-text-secondary text-center py-4">
            You haven't saved any interpretations yet. Explore verses in the <Link to="/interpretations" className="text-brand-primary hover:underline">Interpretation Explorer</Link> and save insights you find valuable.
          </p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
            {savedInterpretations.map(interp => (
              <Card key={interp.id} title={`${interp.passage} - ${interp.theologianName || 'AI Interpretation'}`} className="bg-brand-surface shadow-sm border-l-4 border-brand-accent">
                <p className="text-xs text-brand-text-secondary mb-1">{interp.theologianTradition || 'General Christian Perspective'}</p>
                <p className="text-sm text-brand-text-primary mb-2">{interp.summary}</p>
                {interp.keywords && interp.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {interp.keywords.map(kw => (
                      <span key={kw} className="px-1.5 py-0.5 bg-brand-accent/20 text-brand-accent-darker text-xs rounded-full">{kw}</span>
                    ))}
                  </div>
                )}
                 <div className="text-right">
                    <Button 
                        onClick={() => handleRemoveSavedInterpretation(interp.id)} 
                        variant="ghost" 
                        size="sm" 
                        className="!p-1.5"
                        aria-label={`Remove saved interpretation for ${interp.passage}`}
                    >
                        <TrashIcon className="w-4 h-4 text-red-500/70 hover:text-red-500" />
                    </Button>
                 </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

export default LibraryPage;

import React, { useState } from 'react';
import { UserProfile } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import TextArea from './common/TextArea';
import { SparklesIcon, BookOpenIcon } from './common/IconComponents'; // Re-using SparklesIcon

interface MeditationPageProps {
  userProfile: UserProfile | null;
}

const MeditationPage: React.FC<MeditationPageProps> = ({ userProfile }) => {
  const [dailyScripture, setDailyScripture] = useState<string>("Psalm 46:10 - \"Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.\" (Example)");
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlayPauseMeditation = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control an audio player
    console.log(isPlaying ? "Pausing meditation audio" : "Playing meditation audio");
  };

  const handleSaveReflection = () => {
    // In a real app, this would save to journal or a dedicated reflections store
    console.log("Saving reflection:", reflectionText);
    alert("Reflection saved (simulated)!");
    setReflectionText('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3">
        <SparklesIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">Daily Meditation</h1>
      </div>
      
      <Card title="Today's Scripture Focus" titleClassName="font-display text-2xl">
        <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-lg shadow-inner">
          <BookOpenIcon className="w-8 h-8 text-brand-accent mb-2" />
          <p className="text-lg text-brand-text-primary font-serif leading-relaxed italic">
            {dailyScripture}
          </p>
        </div>
      </Card>

      <Card title="Guided Meditation" titleClassName="font-display text-2xl">
        <div className="text-center py-4">
          <p className="text-brand-text-secondary mb-4">
            Take a few moments to center yourself. Click play to begin the guided audio meditation.
          </p>
          <Button 
            onClick={handlePlayPauseMeditation} 
            variant={isPlaying ? "danger" : "primary"}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isPlaying ? "Pause Meditation" : "Play Guided Meditation"}
          </Button>
          {isPlaying && <p className="text-sm text-brand-primary mt-3 animate-pulse">Playing audio... (Simulated)</p>}
          {!isPlaying && dailyScripture && <p className="text-sm text-brand-text-secondary mt-3">Ready when you are.</p>}
        </div>
      </Card>

      <Card title="Your Reflections" titleClassName="font-display text-2xl">
        <TextArea
          label="Jot down any thoughts, feelings, or insights from your meditation:"
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="What stood out to you? How does this apply to your day?"
          rows={6}
          className="text-base"
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveReflection} disabled={!reflectionText.trim()} variant="secondary">
            Save Reflection
          </Button>
        </div>
      </Card>
      
      <div className="text-center mt-8">
        <p className="text-sm text-brand-text-secondary">
          Come back tomorrow for a new meditation experience.
        </p>
      </div>
    </div>
  );
};

export default MeditationPage;

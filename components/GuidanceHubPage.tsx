
import React, { useState, useEffect } from 'react';
import { UserProfile, PrayerRequest } from '../types';
import { getScripturalWisdomForSituation, generatePersonalizedPrayer } from '../services/GeminiService';
import Card from './common/Card';
import TextArea from './common/TextArea';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { LightBulbIcon, SparklesIcon, BookOpenIcon, HeartIcon, PlusCircleIcon, CheckCircleIcon } from './common/IconComponents';
import { triggerHapticFeedback } from '../utils/haptics';
import useLocalStorage from '../hooks/useLocalStorage';


interface GuidanceHubPageProps {
  userProfile: UserProfile | null;
}

interface ScripturalWisdomContent {
  title: string;
  content: string;
  passageRef?: string;
}

const PrayerJournalStorageKey = 'prayerRequests_growthpath';

const GuidanceHubPage: React.FC<GuidanceHubPageProps> = ({ userProfile }) => {
  const [situation, setSituation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scripturalWisdom, setScripturalWisdom] = useState<ScripturalWisdomContent | null>(null);
  const [personalizedPrayer, setPersonalizedPrayer] = useState<string | null>(null);

  const [prayerAddedMessage, setPrayerAddedMessage] = useState<string | null>(null);
  const [currentPrayerAddedToJournal, setCurrentPrayerAddedToJournal] = useState<boolean>(false);

  // We don't directly use setPrayerRequests from here, but it initializes the hook for localStorage interaction.
  const [prayerRequests, setPrayerRequests] = useLocalStorage<PrayerRequest[]>(PrayerJournalStorageKey, []);


  const handleGetGuidance = async () => {
    if (!situation.trim()) {
      setError("Please describe your situation or question first.");
      triggerHapticFeedback('error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScripturalWisdom(null);
    setPersonalizedPrayer(null);
    setPrayerAddedMessage(null);
    setCurrentPrayerAddedToJournal(false); // Reset for new prayer
    triggerHapticFeedback('medium');

    try {
      const [wisdomResponse, prayerResponse] = await Promise.all([
        getScripturalWisdomForSituation(situation, userProfile),
        generatePersonalizedPrayer(situation, userProfile)
      ]);

      setScripturalWisdom(wisdomResponse);
      setPersonalizedPrayer(prayerResponse);

      if (!wisdomResponse.content && !prayerResponse) {
        setError("The AI couldn't provide specific guidance for this situation. Please try rephrasing or a different topic.");
      }
      
    } catch (err) {
      console.error("Error fetching guidance:", err);
      setError("An error occurred while fetching guidance. Please check your connection and try again.");
      triggerHapticFeedback('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrayerToJournal = () => {
    if (!personalizedPrayer || currentPrayerAddedToJournal) return;
    triggerHapticFeedback('light');

    const newPrayer: PrayerRequest = {
      id: `guidance-prayer-${Date.now()}`,
      text: personalizedPrayer,
      timestamp: new Date(),
      isAnswered: false,
      sharedWithCommunity: false, // Default for prayers added from hub
    };

    // Directly update localStorage
    try {
      const existingPrayersJSON = localStorage.getItem(PrayerJournalStorageKey);
      const existingPrayers: PrayerRequest[] = existingPrayersJSON ? JSON.parse(existingPrayersJSON) : [];
      const updatedPrayers = [newPrayer, ...existingPrayers];
      localStorage.setItem(PrayerJournalStorageKey, JSON.stringify(updatedPrayers));
      
      // Update local state via the hook if needed for other components, though direct modification is for this one-off
      setPrayerRequests(updatedPrayers);


      setCurrentPrayerAddedToJournal(true);
      setPrayerAddedMessage("Prayer added to Journal. Reminder set (simulated).");
      setTimeout(() => setPrayerAddedMessage(null), 4000);

    } catch (e) {
      console.error("Error saving prayer to localStorage:", e);
      setError("Could not save prayer to journal. Please try again.");
      triggerHapticFeedback('error');
    }
  };
  
  useEffect(() => {
    if (prayerAddedMessage) {
      const timer = setTimeout(() => {
        setPrayerAddedMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [prayerAddedMessage]);


  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3">
        <LightBulbIcon className="w-10 h-10 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">Guidance Hub</h1>
      </div>
      <p className="text-brand-text-secondary text-base">
        Facing a challenge, seeking direction, or have a question on your heart? Share it below for AI-powered scriptural insights and prayer.
      </p>

      <Card title="Describe Your Situation or Question" titleClassName="font-display text-xl">
        <TextArea
          name="situationInput"
          label="What's on your mind? (e.g., feeling stressed, question about forgiveness, need encouragement)"
          value={situation}
          onChange={(e) => {
            setSituation(e.target.value);
            if (error) setError(null); 
            if (prayerAddedMessage) setPrayerAddedMessage(null);
          }}
          placeholder="Type here..."
          rows={5}
          className="text-base"
          disabled={isLoading}
        />
        {error && <p className="text-sm text-red-600 mt-2 bg-red-100 p-2 rounded-md">{error}</p>}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleGetGuidance}
            isLoading={isLoading}
            disabled={!situation.trim()}
            variant="primary"
            size="lg"
            leftIcon={<SparklesIcon className="w-5 h-5" />}
          >
            Get Guidance
          </Button>
        </div>
      </Card>

      {isLoading && <LoadingSpinner message="Seeking wisdom for you..." className="my-8" />}
      
      {prayerAddedMessage && !isLoading && (
        <div className="bg-green-500/10 border-l-4 border-green-500 text-green-700 p-3 my-4 rounded-md shadow-sm flex items-center space-x-2 text-sm" role="alert">
          <CheckCircleIcon className="w-5 h-5"/>
          <p>{prayerAddedMessage}</p>
        </div>
      )}


      {!isLoading && scripturalWisdom && scripturalWisdom.content && (
        <Card 
            title={scripturalWisdom.title || "Scriptural Wisdom"} 
            className="bg-brand-primary/5 border-l-4 border-brand-primary"
            titleClassName="text-brand-primary flex items-center"
        >
            <div className="flex items-start mb-2">
                 <BookOpenIcon className="w-7 h-7 text-brand-primary mr-3 mt-1 flex-shrink-0" />
                 <div>
                    {scripturalWisdom.passageRef && (
                    <p className="text-sm font-semibold text-brand-accent-darker mb-1">
                        Consider: {scripturalWisdom.passageRef}
                    </p>
                    )}
                    <p className="text-brand-text-primary whitespace-pre-wrap text-base leading-relaxed">
                    {scripturalWisdom.content}
                    </p>
                 </div>
            </div>
        </Card>
      )}

      {!isLoading && personalizedPrayer && (
        <Card 
            title="A Personalized Prayer For You" 
            className="bg-brand-accent/10 border-l-4 border-brand-accent"
            titleClassName="text-brand-accent-darker flex items-center"
        >
             <div className="flex items-start">
                <HeartIcon className="w-7 h-7 text-brand-accent-darker mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-text-primary whitespace-pre-wrap text-base leading-relaxed italic">
                    {personalizedPrayer}
                </p>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-accent/20 flex justify-end">
                <Button 
                    onClick={handleAddPrayerToJournal}
                    disabled={currentPrayerAddedToJournal}
                    variant="outline"
                    size="sm"
                    leftIcon={currentPrayerAddedToJournal ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <PlusCircleIcon className="w-4 h-4" />}
                >
                    {currentPrayerAddedToJournal ? "Added to Journal" : "Add to Prayer Journal"}
                </Button>
            </div>
        </Card>
      )}
      
      {!isLoading && !scripturalWisdom && !personalizedPrayer && situation && !error && (
         <Card>
            <p className="text-brand-text-secondary text-center py-4">
              Guidance session complete. Feel free to ask about something new.
            </p>
          </Card>
      )}

    </div>
  );
};

export default GuidanceHubPage;

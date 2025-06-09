
import React, { useState, useEffect, useMemo } from 'react';
import { PrayerRequest, JournalEntry, UserProfile } from '../types'; 
import Card from './common/Card';
import Button from './common/Button';
import TextArea from './common/TextArea';
import Input from './common/Input';
import Modal from './common/Modal';
import LoadingSpinner from './common/LoadingSpinner';
import MultiSelectTags from './common/MultiSelectTags';
import { PlusCircleIcon, CheckCircleIcon, LightBulbIcon, BookOpenIcon, SparklesIcon, PencilIcon, ChatBubbleBottomCenterTextIcon, PencilSquareIcon, FireIcon, QuestionMarkCircleIcon, ShieldCheckIcon, HeartIcon } from './common/IconComponents';
import { SAMPLE_PRAYER_REQUESTS, SAMPLE_JOURNAL_ENTRIES } from '../services/MockDb';
import { analyzePassageForJournal, summarizeJournalEntries, generatePersonalizedPrayer } from '../services/GeminiService'; 
import { PREDEFINED_JOURNAL_TAGS } from '../constants';
import { triggerHapticFeedback } from '../utils/haptics';
import useLocalStorage from '../hooks/useLocalStorage';


type ActiveTab = 'prayer' | 'journal';

interface PrayerJournalProps {
  userProfile?: UserProfile | null; 
}

const PrayerJournalStorageKey = 'prayerRequests_growthpath';
const JournalEntriesStorageKey = 'journalEntries_growthpath';


const PrayerJournal: React.FC<PrayerJournalProps> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('prayer');
  
  // Initialize with empty array as default, useLocalStorage will then try to load from storage or use this empty array
  // if SAMPLE_PRAYER_REQUESTS was used and user had no data, it would overwrite on refresh.
  const [rawPrayerRequests, setRawPrayerRequests] = useLocalStorage<PrayerRequest[]>(PrayerJournalStorageKey, []);
  const [rawJournalEntries, setRawJournalEntries] = useLocalStorage<JournalEntry[]>(JournalEntriesStorageKey, []);
  
  useEffect(() => {
    // One-time check: if local storage is empty and SAMPLE_PRAYER_REQUESTS has items, populate it.
    const storedPrayers = localStorage.getItem(PrayerJournalStorageKey);
    if (!storedPrayers && SAMPLE_PRAYER_REQUESTS.length > 0) {
      setRawPrayerRequests(SAMPLE_PRAYER_REQUESTS);
    }
    const storedJournalEntries = localStorage.getItem(JournalEntriesStorageKey);
    if (!storedJournalEntries && SAMPLE_JOURNAL_ENTRIES.length > 0) {
        setRawJournalEntries(SAMPLE_JOURNAL_ENTRIES);
    }
  }, []); // Runs only once on component mount



  const [showPrayerModal, setShowPrayerModal] = useState<boolean>(false);
  const [newPrayerText, setNewPrayerText] = useState<string>('');
  const [sharePrayer, setSharePrayer] = useState<boolean>(false);
  const [isLoadingAIPrayer, setIsLoadingAIPrayer] = useState<boolean>(false);
  const [aiPrayerError, setAIPrayerError] = useState<string | null>(null);


  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);
  const [newJournalTitle, setNewJournalTitle] = useState<string>('');
  const [newJournalText, setNewJournalText] = useState<string>('');
  const [selectedJournalTags, setSelectedJournalTags] = useState<string[]>([]);
  const [journalPassage, setJournalPassage] = useState<string>('');
  const [passageAnalysis, setPassageAnalysis] = useState<any | null>(null);
  const [isAnalyzingPassage, setIsAnalyzingPassage] = useState<boolean>(false);

  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [journalSummary, setJournalSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const [prayerStreak, setPrayerStreak] = useState(5); 

  const prayerRequests = useMemo(() => {
    return rawPrayerRequests.map(p => {
      let timestamp = p.timestamp;
      if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp);
      } else if (!(timestamp instanceof Date)) {
        console.warn(`Invalid timestamp found for prayer request ${p.id}:`, p.timestamp, "defaulting to current date.");
        timestamp = new Date();
      }
      if (isNaN(timestamp.getTime())) {
          console.warn(`Timestamp for prayer request ${p.id} resulted in an Invalid Date:`, p.timestamp, "defaulting to current date.");
          timestamp = new Date();
      }
      return { ...p, timestamp };
    }).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by newest first
  }, [rawPrayerRequests]);

  const journalEntries = useMemo(() => {
    return rawJournalEntries.map(j => {
      let timestamp = j.timestamp;
      if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp);
      } else if (!(timestamp instanceof Date)) {
        console.warn(`Invalid timestamp found for journal entry ${j.id}:`, j.timestamp, "defaulting to current date.");
        timestamp = new Date();
      }
      if (isNaN(timestamp.getTime())) {
          console.warn(`Timestamp for journal entry ${j.id} resulted in an Invalid Date:`, j.timestamp, "defaulting to current date.");
          timestamp = new Date();
      }
      return { ...j, timestamp };
    }).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by newest first
  }, [rawJournalEntries]);


  const handleAddPrayer = () => {
    if (!newPrayerText.trim()) return;
    triggerHapticFeedback();
    const newPrayer: PrayerRequest = {
      id: `p${Date.now()}`,
      text: newPrayerText,
      timestamp: new Date(),
      isAnswered: false,
      sharedWithCommunity: sharePrayer,
    };
    setRawPrayerRequests(prev => [newPrayer, ...prev]);
    setPrayerStreak(prevStreak => prevStreak + 1);
    setShowPrayerModal(false);
    setNewPrayerText('');
    setSharePrayer(false);
    setAIPrayerError(null);
  };

  const togglePrayerAnswered = (id: string) => {
    triggerHapticFeedback('light');
    setRawPrayerRequests(prev => prev.map(p => p.id === id ? { ...p, isAnswered: !p.isAnswered, timestamp: new Date() } : p));
  };

  const handleGetAIPrayerSuggestion = async () => {
    if (!newPrayerText.trim()) {
      setAIPrayerError("Please type your prayer concern first.");
      return;
    }
    setIsLoadingAIPrayer(true);
    setAIPrayerError(null);
    triggerHapticFeedback('light');
    try {
      const suggestion = await generatePersonalizedPrayer(newPrayerText, userProfile);
      if (newPrayerText.length < 30) {
        setNewPrayerText(suggestion);
      } else {
        setNewPrayerText(`AI Suggestion:\n${suggestion}\n\n---\nYour original thought:\n${newPrayerText}`);
      }
    } catch (error) {
      console.error("Error generating AI prayer:", error);
      setAIPrayerError("Could not generate AI prayer. Please try again or write your own.");
    } finally {
      setIsLoadingAIPrayer(false);
    }
  };


  const handleAddJournal = () => {
    if (!newJournalTitle.trim() || !newJournalText.trim()) return;
    triggerHapticFeedback();
    const newEntry: JournalEntry = {
      id: `j${Date.now()}`,
      title: newJournalTitle,
      text: newJournalText,
      tags: selectedJournalTags,
      timestamp: new Date(),
      mood: passageAnalysis ? 'Reflective (AI Insight)' : 'Thoughtful', 
      themes: passageAnalysis ? [passageAnalysis.theme, 'AI Insight'] : ['Personal Reflection'], 
    };
    setRawJournalEntries(prev => [newEntry, ...prev]);
    setShowJournalModal(false);
    setNewJournalTitle('');
    setNewJournalText('');
    setSelectedJournalTags([]);
    setJournalPassage('');
    setPassageAnalysis(null);
  };

  const handleAnalyzePassage = async () => {
    if (!journalPassage.trim()) return;
    triggerHapticFeedback('light');
    setIsAnalyzingPassage(true);
    setPassageAnalysis(null);
    try {
      const analysis = await analyzePassageForJournal(journalPassage);
      if (analysis && analysis.theme) {
        setPassageAnalysis(analysis);
        setNewJournalText(prev => `${prev}\n\n---\nAI Insight on ${journalPassage}:\nTheme: ${analysis.theme}.\nKey Verse: ${analysis.keyVerse}.\nApplication: ${analysis.applicationPoint}\n---\n`);
      } else {
        setPassageAnalysis({ theme: "Analysis Error", keyVerse: "N/A", applicationPoint: "Could not analyze. Please check passage." });
      }
    } catch (error) {
      console.error("Error analyzing passage:", error);
      setPassageAnalysis({ theme: "Error", keyVerse: "N/A", applicationPoint: "An error occurred." });
    } finally {
      setIsAnalyzingPassage(false);
    }
  };

  const handleSummarizeJournal = async () => {
    if (journalEntries.length === 0) {
      alert("No journal entries to summarize.");
      return;
    }
    triggerHapticFeedback();
    setIsSummarizing(true);
    setShowSummaryModal(true);
    setJournalSummary(null);
    try {
      const summary = await summarizeJournalEntries(journalEntries.slice(0, 10)); 
      setJournalSummary(summary);
    } catch (error) {
      console.error("Error summarizing journal:", error);
      setJournalSummary("Could not generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const openNewEntryModal = () => {
    setNewJournalTitle('');
    setNewJournalText('');
    setSelectedJournalTags([]);
    setJournalPassage('');
    setPassageAnalysis(null);
    setShowJournalModal(true);
  }

  const openNewPrayerModal = () => {
    setNewPrayerText('');
    setSharePrayer(false);
    setAIPrayerError(null);
    setIsLoadingAIPrayer(false);
    setShowPrayerModal(true);
  }

  const getFlameColor = () => {
    if (prayerStreak >= 7) return 'text-red-500'; 
    if (prayerStreak >= 4) return 'text-orange-500'; 
    if (prayerStreak >= 1) return 'text-yellow-500'; 
    return 'text-gray-400'; 
  };

  const soulprintThemes = [
    { name: "Faith", icon: <SparklesIcon className="w-7 h-7 text-brand-accent"/>, focus: "Strong connection" },
    { name: "Love", icon: <HeartIcon className="w-7 h-7 text-red-500"/>, focus: "Growing in compassion" },
    { name: "Doubt", icon: <QuestionMarkCircleIcon className="w-7 h-7 text-yellow-600"/>, focus: "Exploring questions" },
    { name: "Trust", icon: <ShieldCheckIcon className="w-7 h-7 text-green-600"/>, focus: "Building reliance" },
  ];


  return (
    <div className="space-y-6 relative pb-20"> 
      <div className="flex items-center space-x-3">
        <PencilSquareIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">Prayer & Journal</h1>
      </div>
      
      <div className="flex border-b border-brand-primary/20">
        <button 
          onClick={() => setActiveTab('prayer')}
          className={`px-4 py-3 text-base font-medium transition-colors duration-150 ${activeTab === 'prayer' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary/50'}`}
          aria-pressed={activeTab === 'prayer'}
        >
          Prayer Requests
        </button>
        <button 
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-3 text-base font-medium transition-colors duration-150 ${activeTab === 'journal' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary/50'}`}
          aria-pressed={activeTab === 'journal'}
        >
          Spiritual Journal
        </button>
      </div>

      {activeTab === 'prayer' && (
        <Card title="My Prayer List">
            <div className="flex items-center mb-4 p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                <FireIcon className={`w-10 h-10 mr-3 ${getFlameColor()}`} />
                <div>
                    <p className="text-lg font-semibold text-brand-primary">Prayer Streak: {prayerStreak} days</p>
                    <p className="text-xs text-brand-text-secondary">Keep the flame alive with daily prayer!</p>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => console.log("Share streak (simulated)")}
                    aria-label="Share Prayer Streak"
                >
                    Share
                </Button>
            </div>
          {prayerRequests.length === 0 && <p className="text-brand-text-secondary text-center py-4">No prayer requests yet. Add one to start!</p>}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
            {prayerRequests.map(p => (
              <div key={p.id} className={`p-3 rounded-lg shadow-md transition-all duration-300 ${p.isAnswered ? 'bg-green-500/10 border-l-4 border-green-500' : 'bg-brand-accent/10 border-l-4 border-brand-accent'}`}>
                <p className="text-brand-text-primary text-base whitespace-pre-wrap">{p.text}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5">
                  <span className="text-xs text-brand-text-secondary">
                    {p.timestamp.toLocaleDateString()} {p.sharedWithCommunity && '(Shared)'}
                  </span>
                  <Button size="sm" variant={p.isAnswered ? "ghost" : "primary"} onClick={() => togglePrayerAnswered(p.id)} className="min-w-[120px]">
                    {p.isAnswered ? <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600"/> : null}
                    {p.isAnswered ? 'Answered' : 'Mark Answered'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'journal' && (
        <>
            <Card title="My Journal Entries" actions={
                <Button onClick={handleSummarizeJournal} leftIcon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5"/>} variant="outline" size="sm" disabled={journalEntries.length === 0}>
                    AI Summary
                </Button>
            }>
            {journalEntries.length === 0 && <p className="text-brand-text-secondary text-center py-4">No journal entries yet. Create one to reflect on your journey.</p>}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                {journalEntries.map(j => (
                <Card key={j.id} title={j.title} className="bg-brand-primary/5 border-l-4 border-brand-primary hover:shadow-xl transition-shadow">
                    <p className="text-brand-text-primary whitespace-pre-wrap mb-2 text-base leading-relaxed">{j.text}</p>
                    {j.tags && j.tags.length > 0 && (
                    <div className="mt-2 mb-2 flex flex-wrap gap-1.5">
                        {j.tags.map(tag => (
                        <span key={tag} className="text-xs bg-brand-accent/30 text-brand-accent-darker px-2 py-0.5 rounded-full font-medium">{tag}</span>
                        ))}
                    </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-brand-text-secondary pt-2 border-t border-black/5">
                    <span>{j.timestamp.toLocaleDateString()}</span>
                    {j.mood && <span>Mood: {j.mood}</span>}
                    </div>
                    {j.themes && j.themes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {j.themes.map(theme => <span key={theme} className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full">{theme}</span>)}
                    </div>
                    )}
                </Card>
                ))}
            </div>
            </Card>
            <Card title="My Soulprint Journey (Example)" titleClassName="font-display text-xl">
                 <p className="text-sm text-brand-text-secondary mb-3">Visualize your journey through key spiritual themes.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {soulprintThemes.map(theme => (
                        <div key={theme.name} className="flex flex-col items-center p-3 bg-brand-surface border border-brand-primary/10 rounded-lg shadow-sm text-center">
                            {theme.icon}
                            <p className="font-semibold text-brand-primary mt-1.5 text-base">{theme.name}</p>
                            <p className="text-xs text-brand-text-secondary">{theme.focus}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </>
      )}

      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-30">
        <Button 
          onClick={activeTab === 'journal' ? openNewEntryModal : openNewPrayerModal} 
          variant="secondary" 
          size="lg"
          className="rounded-full shadow-2xl w-16 h-16 aspect-square !p-0"
          aria-label={activeTab === 'journal' ? "New Journal Entry" : "New Prayer Request"}
        >
          {activeTab === 'journal' ? <PencilIcon className="w-7 h-7"/> : <PlusCircleIcon className="w-8 h-8"/>}
        </Button>
      </div>

      <Modal isOpen={showPrayerModal} onClose={() => setShowPrayerModal(false)} title="Add New Prayer Request">
        <TextArea
          label="Your Prayer Concern"
          value={newPrayerText}
          onChange={(e) => {
            setNewPrayerText(e.target.value);
            if (aiPrayerError) setAIPrayerError(null); 
          }}
          placeholder="What are you praying for today? (e.g., strength for a friend, guidance on a decision, peace in my heart)"
          rows={5}
          className="text-base"
        />

        <div className="mt-3 mb-2">
            <Button 
                onClick={handleGetAIPrayerSuggestion} 
                isLoading={isLoadingAIPrayer} 
                disabled={!newPrayerText.trim()}
                variant="outline"
                size="sm"
                leftIcon={<LightBulbIcon className="w-4 h-4"/>}
            >
                AI Prayer Assistant
            </Button>
        </div>
        
        {isLoadingAIPrayer && <LoadingSpinner size="sm" message="Crafting prayer..." className="my-2"/>}
        {aiPrayerError && <p className="text-xs text-red-600 my-2 bg-red-50 p-2 rounded">{aiPrayerError}</p>}
        
        <label className="flex items-center space-x-2 mt-3">
          <input type="checkbox" checked={sharePrayer} onChange={(e) => setSharePrayer(e.target.checked)} className="form-checkbox h-4 w-4 text-brand-primary focus:ring-brand-accent"/>
          <span className="text-sm text-brand-text-secondary">Share with community (optional)</span>
        </label>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleAddPrayer} variant="primary" disabled={isLoadingAIPrayer}>Add Prayer</Button>
        </div>
      </Modal>

      <Modal isOpen={showJournalModal} onClose={() => setShowJournalModal(false)} title="Create New Journal Entry" size="lg">
        <Input
          label="Title"
          value={newJournalTitle}
          onChange={(e) => setNewJournalTitle(e.target.value)}
          placeholder="e.g., Reflections on Grace"
          className="text-base"
        />
        <TextArea
          label="Your Thoughts"
          value={newJournalText}
          onChange={(e) => setNewJournalText(e.target.value)}
          placeholder="Write your reflections here..."
          rows={8}
          className="text-base leading-relaxed"
        />
         <MultiSelectTags
            availableTags={PREDEFINED_JOURNAL_TAGS}
            selectedTags={selectedJournalTags}
            onChange={setSelectedJournalTags}
            label="Tags (Optional)"
        />
        <div className="mt-4 p-3 bg-brand-primary/5 rounded-md border border-brand-primary/10">
          <h4 className="text-sm font-semibold text-brand-primary mb-2 flex items-center"><LightBulbIcon className="w-5 h-5 mr-1.5 text-brand-accent"/>AI Insight (Optional)</h4>
          <Input
            label="Enter a Bible passage for AI-assisted reflection (e.g., Psalm 23 or John 3:16)"
            value={journalPassage}
            onChange={(e) => setJournalPassage(e.target.value)}
            placeholder="e.g. Philippians 4:13"
            containerClassName="mb-2"
            className="text-sm"
          />
          <Button onClick={handleAnalyzePassage} isLoading={isAnalyzingPassage} size="sm" variant="outline" leftIcon={<BookOpenIcon className="w-4 h-4"/>} disabled={!journalPassage.trim()}>
            Analyze Passage
          </Button>
          {isAnalyzingPassage && <LoadingSpinner size="sm" message="Analyzing..." className="mt-2"/>}
          {passageAnalysis && !isAnalyzingPassage && (
            <div className="mt-3 text-xs p-3 bg-brand-primary/10 rounded">
              <p className="font-semibold text-brand-primary">AI Insight for {journalPassage}:</p>
              <p><strong>Theme:</strong> {passageAnalysis.theme}</p>
              <p><strong>Key Verse:</strong> {passageAnalysis.keyVerse}</p>
              <p><strong>Application:</strong> {passageAnalysis.applicationPoint}</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleAddJournal} variant="primary">Save Entry</Button>
        </div>
      </Modal>

      <Modal isOpen={showSummaryModal} onClose={() => setShowSummaryModal(false)} title="AI Journal Summary" size="lg">
        {isSummarizing && <LoadingSpinner message="Generating summary..." />}
        {journalSummary && !isSummarizing && (
          <div className="whitespace-pre-wrap text-brand-text-primary text-base leading-relaxed p-2 bg-brand-primary/5 rounded-md">
            {journalSummary}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setShowSummaryModal(false)} variant="primary">Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default PrayerJournal;


import React, { useState } from 'react';
import { UserProfile, PlannedActivity, ActivityType, BibleStudyIntensity, AIWeeklyStudyPlan } from '../types';
import { DAYS_OF_WEEK, ACTIVITY_TYPES, BIBLE_STUDY_INTENSITIES } from '../constants';
import { getAISuggestionForActivity, generateWeeklyBibleStudyPlan } from '../services/GeminiService';
import useLocalStorage from '../hooks/useLocalStorage';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import Select from './common/Select';
import Input from './common/Input';
import TextArea from './common/TextArea';
import LoadingSpinner from './common/LoadingSpinner';
import { PlusCircleIcon, CalendarDaysIcon, TrashIcon, CheckCircleIcon, PencilSquareIcon, LightBulbIcon, SparklesIcon } from './common/IconComponents';

interface DiscipleshipPlannerProps {
  userProfile: UserProfile | null;
}

const DiscipleshipPlanner: React.FC<DiscipleshipPlannerProps> = ({ userProfile }) => {
  const [plannedActivities, setPlannedActivities] = useLocalStorage<PlannedActivity[]>('discipleshipPlan_growthpath_v2', []);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<PlannedActivity | null>(null);
  
  const [currentDay, setCurrentDay] = useState<string>('');
  const [currentActivityType, setCurrentActivityType] = useState<ActivityType>(ACTIVITY_TYPES[0]);
  const [currentTimeSlot, setCurrentTimeSlot] = useState<string>('');
  const [currentUserNotes, setCurrentUserNotes] = useState<string>('');
  
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiPassageRef, setAiPassageRef] = useState<string | null>(null);
  const [isLoadingAISuggestion, setIsLoadingAISuggestion] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // AI Weekly Plan State
  const [weeklyStudyIntensity, setWeeklyStudyIntensity] = useState<BibleStudyIntensity>(BibleStudyIntensity.MODERATE);
  const [aiWeeklyPlan, setAiWeeklyPlan] = useState<AIWeeklyStudyPlan | null>(null);
  const [isLoadingAIWeeklyPlan, setIsLoadingAIWeeklyPlan] = useState<boolean>(false);
  const [weeklyPlanError, setWeeklyPlanError] = useState<string | null>(null);


  const openModalForNew = (day: string) => {
    setEditingActivity(null);
    setCurrentDay(day);
    setCurrentActivityType(ACTIVITY_TYPES[0]);
    setCurrentTimeSlot('');
    setCurrentUserNotes('');
    setAiSuggestion(null);
    setAiPassageRef(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (activity: PlannedActivity) => {
    setEditingActivity(activity);
    setCurrentDay(activity.dayOfWeek);
    setCurrentActivityType(activity.activityType);
    setCurrentTimeSlot(activity.timeSlot || '');
    setCurrentUserNotes(activity.userNotes || '');
    setAiSuggestion(activity.aiSuggestion);
    setAiPassageRef(activity.passageRef || null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleGetAISuggestion = async () => {
    if (!currentActivityType || !currentDay) return;
    setIsLoadingAISuggestion(true);
    setError(null);
    try {
      const result = await getAISuggestionForActivity(currentActivityType, currentDay, userProfile);
      setAiSuggestion(result.suggestion);
      setAiPassageRef(result.passageRef || null);
    } catch (err) {
      console.error("Error fetching AI suggestion:", err);
      setError("Failed to get AI suggestion. Please try again or manually enter details.");
    } finally {
      setIsLoadingAISuggestion(false);
    }
  };

  const handleSaveActivity = () => {
    if (!currentDay || !currentActivityType ) {
      setError("Day and activity type are required.");
      return;
    }
    const effectiveSuggestion = aiSuggestion || "User-defined activity"; 

    if (editingActivity) {
      setPlannedActivities(prev => prev.map(act => 
        act.id === editingActivity.id 
        ? { 
            ...act, 
            dayOfWeek: currentDay, 
            activityType: currentActivityType, 
            timeSlot: currentTimeSlot,
            aiSuggestion: effectiveSuggestion,
            passageRef: aiPassageRef || undefined,
            userNotes: currentUserNotes
          } 
        : act
      ));
    } else {
      const newActivity: PlannedActivity = {
        id: `activity-${Date.now()}`,
        dayOfWeek: currentDay,
        activityType: currentActivityType,
        timeSlot: currentTimeSlot,
        aiSuggestion: effectiveSuggestion,
        passageRef: aiPassageRef || undefined,
        userNotes: currentUserNotes,
        isCompleted: false,
      };
      setPlannedActivities(prev => [...prev, newActivity]);
    }
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (window.confirm("Are you sure you want to delete this planned activity?")) {
      setPlannedActivities(prev => prev.filter(act => act.id !== activityId));
    }
  };
  
  const toggleCompleteActivity = (activityId: string) => {
    setPlannedActivities(prev => prev.map(act => 
      act.id === activityId ? { ...act, isCompleted: !act.isCompleted } : act
    ));
  };

  const handleGenerateAIWeeklyPlan = async () => {
    setIsLoadingAIWeeklyPlan(true);
    setWeeklyPlanError(null);
    setAiWeeklyPlan(null);
    try {
      const plan = await generateWeeklyBibleStudyPlan(weeklyStudyIntensity, userProfile);
      setAiWeeklyPlan(plan);
    } catch (err) {
      console.error("Error generating AI weekly plan:", err);
      setWeeklyPlanError("Failed to generate weekly study plan. Please try again.");
    } finally {
      setIsLoadingAIWeeklyPlan(false);
    }
  };

  const addAIPlanActivitiesToPlanner = () => {
    if (!aiWeeklyPlan) return;
    const newActivitiesFromAI: PlannedActivity[] = aiWeeklyPlan.dailyPlan.flatMap(dayPlan => {
      if (!dayPlan.focus && !dayPlan.passage) return []; // Skip if no core content
      return [{
        id: `ai-plan-${dayPlan.day}-${Date.now()}-${Math.random()}`,
        dayOfWeek: dayPlan.day,
        activityType: 'Bible Study', // Default for AI generated weekly plan
        timeSlot: 'Flexible', // Default time
        aiSuggestion: dayPlan.focus + (dayPlan.tasks ? ` Tasks: ${dayPlan.tasks.join(', ')}` : ''),
        passageRef: dayPlan.passage,
        userNotes: 'Generated by AI Weekly Planner.',
        isCompleted: false,
      }];
    });
    setPlannedActivities(prev => [...prev, ...newActivitiesFromAI]);
    alert(`${newActivitiesFromAI.length} activities from the AI-generated plan have been added to your planner.`);
    setAiWeeklyPlan(null); // Clear the displayed AI plan after adding
  };


  const activityOptions = ACTIVITY_TYPES.map(type => ({ value: type, label: type }));
  const intensityOptions = BIBLE_STUDY_INTENSITIES.map(item => ({ value: item.value, label: item.label }));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CalendarDaysIcon className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">Discipleship Planner</h1>
      </div>
      <p className="text-brand-text-secondary text-base">
        Plan your spiritual activities. Get AI-powered suggestions to guide your study, prayer, and reflection.
      </p>

      <Card title="AI Weekly Bible Study Generator" className="bg-brand-accent/10 border-brand-accent" titleClassName="font-display text-xl">
        <div className="space-y-3">
          <Select
            label="Select Study Intensity for Next Week:"
            options={intensityOptions}
            value={weeklyStudyIntensity}
            onChange={(e) => setWeeklyStudyIntensity(e.target.value as BibleStudyIntensity)}
            containerClassName="mb-0"
          />
          <Button onClick={handleGenerateAIWeeklyPlan} isLoading={isLoadingAIWeeklyPlan} variant="secondary" leftIcon={<SparklesIcon className="w-5 h-5" />}>
            Generate AI Study Plan
          </Button>
          {weeklyPlanError && <p className="text-red-600 text-sm bg-red-100 p-2 rounded-md">{weeklyPlanError}</p>}
        </div>

        {isLoadingAIWeeklyPlan && <LoadingSpinner message="Generating your weekly Bible study plan..." className="my-4" />}
        
        {aiWeeklyPlan && !isLoadingAIWeeklyPlan && (
          <div className="mt-4 space-y-3 p-3 bg-brand-surface rounded-md shadow">
            <h3 className="text-lg font-semibold text-brand-primary">{aiWeeklyPlan.title}</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {aiWeeklyPlan.dailyPlan.map(dayPlan => (
                <div key={dayPlan.day} className="p-2 border-b border-brand-primary/10">
                  <p className="font-semibold text-brand-primary">{dayPlan.day}</p>
                  <p className="text-sm text-brand-text-secondary">Focus: {dayPlan.focus}</p>
                  {dayPlan.passage && <p className="text-xs text-brand-accent-darker">Passage: {dayPlan.passage}</p>}
                  {dayPlan.tasks && dayPlan.tasks.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-brand-text-secondary pl-2 mt-1">
                      {dayPlan.tasks.map((task, i) => <li key={i}>{task}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={addAIPlanActivitiesToPlanner} variant="primary" size="sm" className="mt-3" leftIcon={<PlusCircleIcon className="w-4 h-4" />}>
              Add This Plan to My Planner
            </Button>
          </div>
        )}
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {DAYS_OF_WEEK.map(day => (
          <Card key={day} title={day} className="min-h-[250px] flex flex-col bg-brand-surface shadow-md" titleClassName="font-display text-xl">
            <div className="space-y-3 mb-4 flex-grow min-h-[180px] max-h-[50vh] overflow-y-auto p-1">
              {plannedActivities.filter(act => act.dayOfWeek === day).sort((a,b) => (a.timeSlot || "23:59").localeCompare(b.timeSlot || "23:59")).map(activity => (
                <div 
                  key={activity.id} 
                  className={`p-3 rounded-lg shadow-sm text-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg
                              ${activity.isCompleted 
                                ? 'bg-green-500/10 border-green-500' 
                                : 'bg-brand-primary/5 border-brand-primary'} border-l-4`}
                >
                  <div className={`font-semibold ${activity.isCompleted ? 'text-green-700' : 'text-brand-primary'}`}>{activity.activityType} {activity.timeSlot ? `(${activity.timeSlot})` : ''}</div>
                  <p className="text-xs text-brand-text-secondary italic mt-0.5">"{activity.aiSuggestion}"</p>
                  {activity.passageRef && <p className="text-xs text-brand-primary font-medium mt-0.5">Suggested: {activity.passageRef}</p>}
                  {activity.userNotes && <p className="text-xs text-gray-600 mt-1 pt-1 border-t border-black/5">Notes: {activity.userNotes}</p>}
                  <div className="mt-2.5 flex items-center justify-end space-x-1.5">
                     <button 
                        onClick={() => toggleCompleteActivity(activity.id)} 
                        className="p-2.5 rounded-full hover:bg-gray-200/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent" 
                        aria-label={activity.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                        style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {activity.isCompleted ? <CheckCircleIcon className="w-5 h-5 text-green-600" /> : <CheckCircleIcon className="w-5 h-5 text-gray-400 hover:text-green-500" />}
                    </button>
                    <button 
                        onClick={() => openModalForEdit(activity)} 
                        className="p-2.5 rounded-full hover:bg-gray-200/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent" 
                        aria-label="Edit Activity"
                        style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <PencilSquareIcon className="w-5 h-5 text-gray-500 hover:text-brand-primary" />
                    </button>
                    <button 
                        onClick={() => handleDeleteActivity(activity.id)} 
                        className="p-2.5 rounded-full hover:bg-gray-200/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent" 
                        aria-label="Delete Activity"
                        style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <TrashIcon className="w-5 h-5 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
              {plannedActivities.filter(act => act.dayOfWeek === day).length === 0 && (
                <p className="text-xs text-brand-text-secondary text-center py-4">No activities planned.</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => openModalForNew(day)} leftIcon={<PlusCircleIcon className="w-4 h-4"/>} className="w-full mt-auto">
              Plan Activity
            </Button>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingActivity ? `Edit Activity for ${currentDay}` : `Plan Activity for ${currentDay}`}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Activity Type"
            options={activityOptions}
            value={currentActivityType}
            onChange={(e) => {
              setCurrentActivityType(e.target.value as ActivityType);
              setAiSuggestion(null); 
              setAiPassageRef(null); 
            }}
            className="text-base"
          />
          <Input 
            label="Time (Optional, e.g., 8:00 AM or Morning)"
            placeholder="e.g., Morning, 3:00 PM"
            value={currentTimeSlot}
            onChange={(e) => setCurrentTimeSlot(e.target.value)}
            className="text-base"
          />

          {error && <p className="text-red-600 text-sm bg-red-100 p-2 rounded-md">{error}</p>}

          <Button onClick={handleGetAISuggestion} isLoading={isLoadingAISuggestion} disabled={!currentActivityType || !currentDay} variant="secondary">
            {aiSuggestion && !isLoadingAISuggestion ? 'Refresh AI Suggestion' : 'Get AI Suggestion'}
          </Button>

          {isLoadingAISuggestion && <LoadingSpinner message="Getting suggestion..." />}
          
          {aiSuggestion && !isLoadingAISuggestion && (
            <Card title="AI Suggestion" className="bg-brand-accent/10 border-brand-accent/20">
              <p className="text-brand-text-primary text-base">{aiSuggestion}</p>
              {aiPassageRef && <p className="mt-1 text-sm text-brand-primary font-medium">Suggested Passage: {aiPassageRef}</p>}
            </Card>
          )}
          
          <TextArea
            label="Your Notes (Optional)"
            value={currentUserNotes}
            onChange={(e) => setCurrentUserNotes(e.target.value)}
            placeholder="Any specific thoughts, goals, or reminders for this activity?"
            rows={3}
            className="text-base"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveActivity} disabled={isLoadingAISuggestion} variant="primary">
              {editingActivity ? 'Update Activity' : 'Add to Plan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DiscipleshipPlanner;
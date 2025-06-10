
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import Footer from './components/Footer';
import InterpretationExplorer from './components/InterpretationExplorer';
import PersonalCoach from './components/PersonalCoach';
import PrayerJournal from './components/PrayerJournal';
import CommunityConnect from './components/CommunityConnect';
import SpiritualGrowthTracker from './components/SpiritualGrowthTracker';
import Onboarding from './components/Onboarding';
import DiscipleshipPlanner from './components/DiscipleshipPlanner';
import SubscriptionPage from './components/SubscriptionPage';
import ProfileSettingsPage from './components/ProfileSettingsPage';
import MeditationPage from './components/MeditationPage'; 
import LibraryPage from './components/LibraryPage'; // New
import FloatingCoachWidget from './components/FloatingCoachWidget';
import { UserProfile, BibleKnowledgeLevel, Interpretation } from './types';
import { HomeIcon, BookOpenIcon, ChatBubbleLeftEllipsisIcon, UsersIcon, SparklesIcon, ArrowPathIcon, CalendarDaysIcon, CreditCardIcon, Cog6ToothIcon, ShieldCheckIcon, IconProps, PencilSquareIcon, FaceSmileIcon, QuestionMarkCircleIcon, LightBulbIcon, ChartBarIcon, AcademicCapIcon } from './components/common/IconComponents'; 
import { PREMIUM_TIER_NAME, SUBSCRIPTION_PRICE, DEFAULT_NOTIFICATION_SETTINGS } from './constants';

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete_growthpath');
    if (onboardingComplete === 'true') {
      setShowOnboarding(false);
      const storedProfile = localStorage.getItem('userProfile_growthpath');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile) as UserProfile;
        setUserProfile({
          name: parsedProfile.name || '',
          spiritualGoal: parsedProfile.spiritualGoal || 'Understand the Bible better',
          bibleKnowledge: parsedProfile.bibleKnowledge || BibleKnowledgeLevel.BEGINNER,
          preferredTradition: parsedProfile.preferredTradition || 'Exploring',
          isSubscribed: parsedProfile.isSubscribed || false,
          subscriptionTier: parsedProfile.isSubscribed ? (parsedProfile.subscriptionTier || PREMIUM_TIER_NAME) : undefined,
          spiritualInterests: parsedProfile.spiritualInterests || '',
          preferredBibleTranslation: parsedProfile.preferredBibleTranslation || 'NIV',
          devotionalTimePreference: parsedProfile.devotionalTimePreference || 'Flexible',
          aiFeedbackLevel: parsedProfile.aiFeedbackLevel || 'Detailed',
          aiCheckInFrequency: parsedProfile.aiCheckInFrequency || 'Daily',
          notificationSettings: {
            ...DEFAULT_NOTIFICATION_SETTINGS, 
            ...(parsedProfile.notificationSettings || {}), 
          },
          readChapters: parsedProfile.readChapters || [],
          savedInterpretations: parsedProfile.savedInterpretations || [],
        });
      }
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    const initialProfile: UserProfile = {
      ...profile,
      name: profile.name || '',
      isSubscribed: false,
      spiritualInterests: profile.spiritualInterests || '',
      preferredBibleTranslation: profile.preferredBibleTranslation || 'NIV',
      devotionalTimePreference: profile.devotionalTimePreference || 'Flexible',
      aiFeedbackLevel: profile.aiFeedbackLevel || 'Detailed',
      aiCheckInFrequency: profile.aiCheckInFrequency || 'Daily',
      notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS }, 
      readChapters: [],
      savedInterpretations: [],
    };
    setUserProfile(initialProfile);
    localStorage.setItem('userProfile_growthpath', JSON.stringify(initialProfile));
    localStorage.setItem('onboardingComplete_growthpath', 'true');
    setShowOnboarding(false);
  };

  const handleSubscriptionUpdate = () => {
    setUserProfile(prevProfile => {
      if (!prevProfile) return null;
      const updatedProfile = {
        ...prevProfile,
        isSubscribed: true,
        subscriptionTier: PREMIUM_TIER_NAME,
      };
      localStorage.setItem('userProfile_growthpath', JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  };

  const updateUserProfileSettings = (updatedSettings: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
      if (!prevProfile) return null;
      const newProfile = { 
        ...prevProfile, 
        ...updatedSettings,
        notificationSettings: {
          ...(prevProfile.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS),
          ...(updatedSettings.notificationSettings || {}),
        },
        // Ensure arrays are handled correctly if passed in updatedSettings
        readChapters: updatedSettings.readChapters || prevProfile.readChapters || [],
        savedInterpretations: updatedSettings.savedInterpretations || prevProfile.savedInterpretations || [],
      };
      localStorage.setItem('userProfile_growthpath', JSON.stringify(newProfile));
      return newProfile;
    });
  };
  
  const navItems = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Interpretations', path: '/interpretations', icon: <BookOpenIcon /> },
    { name: 'Coach', path: '/coach', icon: <ChatBubbleLeftEllipsisIcon /> },
    { name: 'Library', path: '/library', icon: <AcademicCapIcon /> }, // New
    { name: 'Planner', path: '/planner', icon: <CalendarDaysIcon /> },
    { name: 'Prayer & Journal', path: '/prayer-journal', icon: <PencilSquareIcon /> },
    { name: 'Meditation', path: '/meditation', icon: <FaceSmileIcon /> },
    { name: 'Community', path: '/community', icon: <UsersIcon /> },
    { name: 'Growth', path: '/growth', icon: <ArrowPathIcon /> },
    { name: 'Settings', path: '/settings', icon: <Cog6ToothIcon /> },
  ];
  const dynamicNavItems = userProfile?.isSubscribed && userProfile.subscriptionTier === PREMIUM_TIER_NAME
    ? navItems 
    : [...navItems, { name: `Go ${PREMIUM_TIER_NAME}!`, path: '/subscription', icon: <CreditCardIcon /> }];


  const bottomNavItems = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Library', path: '/library', icon: <AcademicCapIcon /> }, // New
    { name: 'Prayer', path: '/prayer-journal', icon: <PencilSquareIcon /> },
    { name: 'Coach', path: '/coach', icon: <ChatBubbleLeftEllipsisIcon /> },
    { name: 'Settings', path: '/settings', icon: <Cog6ToothIcon /> },
  ].slice(0, 5); 

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-background text-brand-text-primary">
      <Navbar navItems={dynamicNavItems} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
        <Routes>
          <Route path="/" element={<Dashboard userProfile={userProfile} />} />
          <Route 
            path="/interpretations" 
            element={
              <InterpretationExplorer 
                userProfile={userProfile} 
                onUpdateProfile={updateUserProfileSettings} 
              />} 
          />
          <Route path="/coach" element={<PersonalCoach userProfile={userProfile} />} />
          <Route 
            path="/library" 
            element={
              <LibraryPage 
                userProfile={userProfile} 
                onUpdateProfile={updateUserProfileSettings} 
              />} 
          /> {/* New */}
          <Route path="/planner" element={<DiscipleshipPlanner userProfile={userProfile} />} />
          <Route path="/prayer-journal" element={<PrayerJournal userProfile={userProfile} />} />
          <Route path="/meditation" element={<MeditationPage userProfile={userProfile} />} />
          <Route path="/community" element={<CommunityConnect />} />
          <Route path="/subscription" element={<SubscriptionPage userProfile={userProfile} onSubscribeSuccess={handleSubscriptionUpdate} />} />
          <Route path="/growth" element={<SpiritualGrowthTracker />} />
          <Route path="/settings" element={<ProfileSettingsPage userProfile={userProfile} onUpdateProfile={updateUserProfileSettings} />} />
        </Routes>
      </main>
      <Footer />
      <BottomNavbar navItems={bottomNavItems} />
      {!showOnboarding && userProfile && <FloatingCoachWidget userProfile={userProfile} />}
    </div>
  );
};

interface DashboardProps {
  userProfile: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  const missionStatement = "GrowthPath is your intelligent, compassionate spiritual companion — designed to guide Christians from curiosity to deep discipleship using personalized, contextual Bible engagement.";
  
  return (
    <div className="space-y-12"> {/* Increased overall spacing */}
      <div className="bg-gradient-to-br from-brand-primary/5 via-brand-background to-brand-background p-6 md:p-10 rounded-xl shadow-xl text-center mb-10">
        {userProfile && userProfile.name && (
          <p className="text-2xl md:text-3xl font-display text-brand-primary mb-4">
            Hello, {userProfile.name}!
          </p>
        )}
        <p className={`text-lg text-brand-text-primary/90 max-w-3xl mx-auto ${userProfile && userProfile.name ? 'mt-3' : ''}`}>
          {missionStatement}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Explore Wisdom" description="Dive into biblical wisdom across traditions." link="/interpretations" icon={<BookOpenIcon />} />
        <DashboardCard title="AI Discipleship Coach" description="Get personalized guidance and adaptive study sessions." link="/coach" icon={<ChatBubbleLeftEllipsisIcon />} />
        <DashboardCard title="My Library" description="Access your read chapters, saved notes, and study progress." link="/library" icon={<AcademicCapIcon />} />
        <DashboardCard title="Discipleship Planner" description="Plan your week with AI-assisted spiritual activities." link="/planner" icon={<CalendarDaysIcon />} />
        <DashboardCard title="Prayer & Journal" description="Deepen your prayer life and reflect on your journey." link="/prayer-journal" icon={<PencilSquareIcon />} />
        <DashboardCard title="Daily Meditation" description="Start your day with guided scripture meditation." link="/meditation" icon={<FaceSmileIcon />} />
        <DashboardCard title="Spiritual Resilience" description="AI-powered insights into your faith, peace, love, and trust. Track your growth over time. (Example Score: 78/100)" link="/growth" icon={<ShieldCheckIcon />} />
        <DashboardCard title="Track Your Growth" description="Monitor your spiritual milestones and progress." link="/growth" icon={<ArrowPathIcon />} />
        <DashboardCard title="Community Connect" description="Find and engage with like-minded individuals." link="/community" icon={<UsersIcon />} />
        
        {!(userProfile?.isSubscribed && userProfile.subscriptionTier === PREMIUM_TIER_NAME) && (
          <DashboardCard 
            title={`Go ${PREMIUM_TIER_NAME}!`} 
            description={`Unlock all features for $${SUBSCRIPTION_PRICE.toFixed(2)}/month.`} 
            link="/subscription" 
            icon={<CreditCardIcon />} 
            isAccent 
          />
        )}
         {userProfile?.isSubscribed && userProfile.subscriptionTier === PREMIUM_TIER_NAME && (
          <DashboardCard title={`Manage ${PREMIUM_TIER_NAME} Subscription`} description="View your Pro membership details." link="/subscription" icon={<CreditCardIcon />} />
        )}
        <DashboardCard title="Settings" description="Customize your profile and app preferences." link="/settings" icon={<Cog6ToothIcon />} />
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactElement<IconProps>;
  isAccent?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, link, icon, isAccent = false }) => {
  return (
    <Link 
      to={link} 
      className={`block p-6 bg-brand-surface rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 ${isAccent ? 'border-brand-accent' : 'border-transparent hover:border-brand-primary/30'}`}
    >
      <div className="flex items-center space-x-4 mb-3">
        {React.cloneElement(icon, { className: `w-10 h-10 ${isAccent ? 'text-brand-accent' : 'text-brand-primary'}` })}
        <h2 className={`text-xl font-semibold ${isAccent ? 'text-brand-accent' : 'text-brand-primary'}`}>{title}</h2>
      </div>
      <p className="text-brand-text-secondary text-sm">{description}</p>
    </Link>
  );
};


export default App;

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import { Cog6ToothIcon, CheckCircleIcon } from './common/IconComponents';
import { 
  BIBLE_TRANSLATIONS, 
  DEVOTIONAL_TIMES, 
  AI_FEEDBACK_LEVELS, 
  AI_CHECK_IN_FREQUENCIES,
  DEFAULT_NOTIFICATION_SETTINGS
} from '../constants';

interface ProfileSettingsPageProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (updatedSettings: Partial<UserProfile>) => void;
}

const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({ userProfile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        spiritualGoal: userProfile.spiritualGoal,
        bibleKnowledge: userProfile.bibleKnowledge,
        preferredTradition: userProfile.preferredTradition,
        spiritualInterests: userProfile.spiritualInterests || '',
        preferredBibleTranslation: userProfile.preferredBibleTranslation || BIBLE_TRANSLATIONS[0],
        devotionalTimePreference: userProfile.devotionalTimePreference || DEVOTIONAL_TIMES[0],
        aiFeedbackLevel: userProfile.aiFeedbackLevel || AI_FEEDBACK_LEVELS[0].value,
        aiCheckInFrequency: userProfile.aiCheckInFrequency || AI_CHECK_IN_FREQUENCIES[0].value,
        notificationSettings: {
            ...DEFAULT_NOTIFICATION_SETTINGS, 
            ...(userProfile.notificationSettings || {}) 
        },
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            notificationSettings: {
                ...(prev.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS),
                [name]: checked,
            }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (successMessage) setSuccessMessage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    // Ensure that formData.notificationSettings is fully populated with defaults before saving
    const finalNotificationSettings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(formData.notificationSettings || {})
    };
    onUpdateProfile({...formData, notificationSettings: finalNotificationSettings});
    setSuccessMessage("Settings saved successfully!");
    window.scrollTo(0, 0); 
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  if (!userProfile) {
    return <div className="text-center py-10">Loading profile settings...</div>;
  }
  
  const notificationSettingKeys: Array<keyof typeof DEFAULT_NOTIFICATION_SETTINGS> = [
    'prayerReminders', 'milestoneAlerts', 'communityUpdates', 
    'journalReminders', 'aiCoachPrompts', 'scriptureSuggestions'
  ];


  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <Cog6ToothIcon className="w-10 h-10 text-brand-primary" />
        <h1 className="text-3xl font-display font-bold text-brand-primary">Profile & Settings</h1>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm flex items-center space-x-2" role="alert">
          <CheckCircleIcon className="w-5 h-5"/>
          <p>{successMessage}</p>
        </div>
      )}

      <Card title="Personal Information" titleClassName="font-display text-xl">
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          <Input
            label="Name (Optional)"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="Your name"
          />
          <Input
            label="Current Spiritual Goal"
            name="spiritualGoal"
            value={formData.spiritualGoal || ''}
            onChange={handleChange}
            placeholder="e.g., Understand the Bible better"
          />
          <Input
            label="Spiritual Interests (comma-separated)"
            name="spiritualInterests"
            value={formData.spiritualInterests || ''}
            onChange={handleChange}
            placeholder="e.g., Theology, Apologetics, Prayer"
            containerClassName="md:col-span-2"
          />
          <Select
            label="Preferred Bible Translation"
            name="preferredBibleTranslation"
            value={formData.preferredBibleTranslation || ''}
            onChange={handleChange}
            options={BIBLE_TRANSLATIONS.map(t => ({ value: t, label: t }))}
          />
          <Select
            label="Preferred Devotional Time"
            name="devotionalTimePreference"
            value={formData.devotionalTimePreference || ''}
            onChange={handleChange}
            options={DEVOTIONAL_TIMES.map(t => ({ value: t, label: t }))}
          />
        </div>
      </Card>

      <Card title="AI Personalization" titleClassName="font-display text-xl">
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          <Select
            label="Level of AI Feedback"
            name="aiFeedbackLevel"
            value={formData.aiFeedbackLevel || ''}
            onChange={handleChange}
            options={AI_FEEDBACK_LEVELS}
          />
          <Select
            label="Frequency of AI Check-ins"
            name="aiCheckInFrequency"
            value={formData.aiCheckInFrequency || ''}
            onChange={handleChange}
            options={AI_CHECK_IN_FREQUENCIES}
          />
        </div>
      </Card>
      
      <Card title="Notification Preferences" titleClassName="font-display text-xl">
        <div className="space-y-3">
          {notificationSettingKeys.map((key) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            return (
              <label key={key} className="flex items-center space-x-3 p-2 rounded-md hover:bg-brand-primary/5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name={key}
                  checked={formData.notificationSettings?.[key] || false}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-brand-primary rounded focus:ring-brand-accent focus:ring-offset-brand-surface"
                />
                <span className="text-brand-text-primary text-base">{label}</span>
              </label>
            );
          })}
        </div>
      </Card>

      <Card title="Data Management" titleClassName="font-display text-xl">
        <p className="text-brand-text-secondary text-base mb-2">Advanced data options will be available soon.</p>
        <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="outline" onClick={() => alert('Export Journal Data: Feature coming soon!')}>
            Export Journal Data
            </Button>
            <Button type="button" variant="outline" onClick={() => alert('Export Growth Report: Feature coming soon!')}>
            Export Growth Report
            </Button>
        </div>
      </Card>

      <div className="mt-10 flex justify-end">
        <Button type="submit" size="lg" variant="primary">
          Save All Settings
        </Button>
      </div>
    </form>
  );
};

export default ProfileSettingsPage;
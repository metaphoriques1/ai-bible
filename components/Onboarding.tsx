
import React, { useState } from 'react';
import { UserProfile, BibleKnowledgeLevel, OnboardingQuestion, SelectOnboardingQuestion } from '../types';
import { ONBOARDING_QUESTIONS, APP_NAME } from '../constants';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import Card from './common/Card';
import { LogoIcon } from './common/IconComponents'; // Changed from BookOpenIcon to LogoIcon

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const spiritualGoalQuestion = ONBOARDING_QUESTIONS.find(q => q.id === 'spiritualGoal') as SelectOnboardingQuestion | undefined;
  const initialSpiritualGoal = spiritualGoalQuestion?.options[0] || 'Understand the Bible better';


  const [formData, setFormData] = useState<Partial<UserProfile>>({
    bibleKnowledge: BibleKnowledgeLevel.BEGINNER, 
    preferredTradition: 'Exploring', 
    spiritualGoal: initialSpiritualGoal, 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentQuestion = ONBOARDING_QUESTIONS[step]; 

  const validateStep = (): boolean => {
    const questionToValidate = ONBOARDING_QUESTIONS[step];
    if (!questionToValidate) return true; 

    const value = formData[questionToValidate.id as keyof UserProfile];
    
    if ((questionToValidate.type === 'select' || questionToValidate.type === 'radio') && !value) {
      setErrors(prevErrors => ({ ...prevErrors, [questionToValidate.id]: `Please make a selection for ${questionToValidate.label.toLowerCase()}.` }));
      return false;
    }
    if (questionToValidate.type === 'text' && questionToValidate.id === 'name' && typeof value === 'string' && value.trim().length > 50) {
      setErrors(prevErrors => ({ ...prevErrors, [questionToValidate.id]: `Name should be less than 50 characters.` }));
      return false;
    }


    setErrors(prevErrors => ({ ...prevErrors, [questionToValidate.id]: '' }));
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < ONBOARDING_QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        // Ensure all required fields from the current step are also in formData before completing
        const finalProfileData: UserProfile = {
          name: formData.name || '',
          spiritualGoal: formData.spiritualGoal!, // These are guaranteed by flow or default
          bibleKnowledge: formData.bibleKnowledge!,
          preferredTradition: formData.preferredTradition!,
        };
        onComplete(finalProfileData);
      }
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors({}); 
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof UserProfile]: value }));
     if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleRadioChange = (name: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const progressPercentage = ONBOARDING_QUESTIONS.length > 0 ? ((step + 1) / ONBOARDING_QUESTIONS.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
            <LogoIcon className="w-16 h-16 text-brand-accent mx-auto mb-3" /> {/* Changed to LogoIcon */}
          <h1 className="text-3xl font-display font-bold text-brand-primary mb-1">{APP_NAME}</h1>
          <p className="text-brand-text-secondary text-sm">Your journey to deeper faith starts here.</p>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-brand-accent h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          { ONBOARDING_QUESTIONS.length > 0 && <p className="text-xs text-right text-brand-text-secondary mt-1">Step {step + 1} of {ONBOARDING_QUESTIONS.length}</p> }
        </div>

        {currentQuestion && ( 
          <div className="space-y-4">
            <label className="block text-base font-medium text-brand-text-primary mb-1">{currentQuestion.label}</label>
            {currentQuestion.type === 'text' && (
              <Input
                name={currentQuestion.id}
                placeholder={currentQuestion.placeholder} 
                value={(formData[currentQuestion.id as 'name'] as string) || ''}
                onChange={handleChange}
                error={errors[currentQuestion.id]}
                autoFocus={step === 0} // AutoFocus on first question or name
              />
            )}
            {currentQuestion.type === 'select' && (
              <Select
                name={currentQuestion.id}
                value={(formData[currentQuestion.id as 'spiritualGoal' | 'preferredTradition'] as string) || ''}
                onChange={handleChange}
                options={currentQuestion.options.map(opt => ({value: opt, label: opt}))}
                error={errors[currentQuestion.id]}
              />
            )}
            {currentQuestion.type === 'radio' && (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <label key={option} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md hover:border-brand-accent hover:bg-brand-accent/10 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={formData[currentQuestion.id as 'bibleKnowledge'] === option} 
                      onChange={() => handleRadioChange(currentQuestion.id as 'bibleKnowledge', option)}
                      className="form-radio h-4 w-4 text-brand-primary focus:ring-brand-accent"
                    />
                    <span className="text-brand-text-primary text-sm">{option}</span>
                  </label>
                ))}
                 {errors[currentQuestion.id] && <p className="mt-1 text-xs text-red-600">{errors[currentQuestion.id]}</p>}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-between items-center">
          <Button variant="ghost" onClick={handlePrev} disabled={step === 0}>
            Previous
          </Button>
          <Button onClick={handleNext} disabled={ONBOARDING_QUESTIONS.length === 0 && step === 0}>
            {ONBOARDING_QUESTIONS.length === 0 || step === ONBOARDING_QUESTIONS.length - 1 ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;

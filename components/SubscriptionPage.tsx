
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { SUBSCRIPTION_PRICE, PREMIUM_TIER_NAME, APP_NAME } from '../constants';
import Card from './common/Card';
import Button from './common/Button';
import StripeMockModal from './StripeMockModal';
import { CheckCircleIcon, CreditCardIcon, SparklesIcon } from './common/IconComponents';

interface SubscriptionPageProps {
  userProfile: UserProfile | null;
  onSubscribeSuccess: () => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ userProfile, onSubscribeSuccess }) => {
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  const handleOpenStripeModal = () => setIsStripeModalOpen(true);
  const handleCloseStripeModal = () => setIsStripeModalOpen(false);

  const handleMockPaymentSuccess = () => {
    onSubscribeSuccess();
    handleCloseStripeModal();
  };

  const benefits = [
    "Unlock full access to all AI-powered features.",
    "Access your comprehensive Spiritual Growth Dashboard with advanced analytics.",
    "Save and review your complete chat history with the AI Discipleship Coach.",
    "Unlimited personalized meditation sessions tailored to your needs.",
    "Exclusive 'Pro' member content, including guided study series and deeper theological resources.",
    "Priority support and early access to new platform updates."
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <SparklesIcon className="w-12 h-12 text-brand-accent mx-auto mb-2" />
        <h1 className="text-4xl font-display font-bold text-brand-primary mb-2">
          Upgrade to {APP_NAME} {PREMIUM_TIER_NAME}
        </h1>
        <p className="text-xl text-brand-text-secondary">
          Deepen your discipleship with our most advanced tools and insights.
        </p>
      </div>

      <Card className="shadow-xl border-2 border-brand-accent/50">
        {userProfile?.isSubscribed && userProfile.subscriptionTier === PREMIUM_TIER_NAME ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-brand-primary mb-2">
              You are a {PREMIUM_TIER_NAME} Member!
            </h2>
            <p className="text-brand-text-secondary text-base">
              Thank you for being a valued {PREMIUM_TIER_NAME} member. Enjoy full access to all {APP_NAME} features designed to enrich your spiritual life.
            </p>
            <p className="text-sm text-brand-text-secondary/80 mt-4">
              Your support helps us continue to develop and enhance this platform for our entire community.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <CreditCardIcon className="w-12 h-12 text-brand-accent mx-auto mb-3" />
              <h2 className="text-2xl font-semibold text-brand-primary">
                Unlock {PREMIUM_TIER_NAME} Access
              </h2>
              <p className="text-4xl font-bold text-brand-primary my-2">
                ${SUBSCRIPTION_PRICE.toFixed(2)}<span className="text-base font-normal text-brand-text-secondary">/month</span>
              </p>
               <p className="text-sm text-brand-text-secondary">Start with ${SUBSCRIPTION_PRICE.toFixed(2)}/month.</p>
            </div>

            <div className="mb-8 px-2">
              <h3 className="text-lg font-semibold text-brand-text-primary mb-4">With {PREMIUM_TIER_NAME}, you get:</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-brand-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-text-secondary text-base">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full font-bold tracking-wide"
              onClick={handleOpenStripeModal}
              disabled={userProfile?.isSubscribed && userProfile.subscriptionTier === PREMIUM_TIER_NAME}
            >
              Go {PREMIUM_TIER_NAME} for ${SUBSCRIPTION_PRICE.toFixed(2)}/month
            </Button>
            <p className="text-xs text-center text-brand-text-secondary/80 mt-4">
              Flexible plan. Cancel anytime. Your journey, your terms.
            </p>
          </>
        )}
      </Card>

      <StripeMockModal
        isOpen={isStripeModalOpen}
        onClose={handleCloseStripeModal}
        onPaymentSuccess={handleMockPaymentSuccess}
        amount={SUBSCRIPTION_PRICE}
      />
    </div>
  );
};

export default SubscriptionPage;

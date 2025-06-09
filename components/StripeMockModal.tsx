
import React, { useState } from 'react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';
import { CreditCardIcon } from './common/IconComponents';
import LoadingSpinner from './common/LoadingSpinner';

interface StripeMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
}

const StripeMockModal: React.FC<StripeMockModalProps> = ({ isOpen, onClose, onPaymentSuccess, amount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!cardNumber.trim() || !expiryDate.trim() || !cvc.trim() || !cardName.trim()) {
      setError('Please fill in all card details.');
      return false;
    }
    if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) { // Wider range for card numbers
      setError('Card number should be 13-19 digits.');
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) { // MM/YY format
      setError('Expiry date should be MM/YY.');
      return false;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      setError('CVC should be 3 or 4 digits.');
      return false;
    }
    setError(null);
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    setIsLoading(false);
    onPaymentSuccess();
    // Reset form for next time it's opened
    setCardNumber('');
    setExpiryDate('');
    setCvc('');
    setCardName('');
    setError(null);
  };

  // Clear form and error when modal is closed externally
  React.useEffect(() => {
    if (!isOpen) {
      setCardNumber('');
      setExpiryDate('');
      setCvc('');
      setCardName('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Secure Payment" size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <CreditCardIcon className="w-10 h-10 text-brand-primary mr-2" />
          <span className="text-xl font-semibold text-brand-primary">Pay with Card</span>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>}

        <Input 
          label="Cardholder Name" 
          name="cardName"
          type="text"
          autoComplete="cc-name"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John M. Doe" 
          disabled={isLoading}
        />
        <Input 
          label="Card Number" 
          name="cardNumber"
          type="text" // Use text to allow spaces, validation handles actual digits
          autoComplete="cc-number"
          inputMode="numeric"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0,23))} // Auto-space and limit
          placeholder="0000 0000 0000 0000" 
          disabled={isLoading}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Expiry Date (MM/YY)" 
            name="expiryDate"
            type="text"
            autoComplete="cc-exp"
            inputMode="numeric"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/').trim().slice(0,5))}
            placeholder="MM/YY" 
            disabled={isLoading}
          />
          <Input 
            label="CVC" 
            name="cvc"
            type="text"
            autoComplete="cc-csc"
            inputMode="numeric"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0,4))}
            placeholder="123" 
            disabled={isLoading}
          />
        </div>
        
        {isLoading ? (
          <div className="py-6 flex flex-col items-center">
            <LoadingSpinner message="Processing payment securely..." />
          </div>
        ) : (
          <Button 
            onClick={handlePayment} 
            className="w-full mt-6" 
            size="lg"
            variant="primary" // Use primary button variant
            disabled={isLoading}
          >
            Pay ${amount.toFixed(2)} Securely
          </Button>
        )}

        <p className="text-xs text-brand-text-secondary text-center mt-2">
          This is a simulated payment environment. No real charges will be made.
        </p>
      </div>
    </Modal>
  );
};

export default StripeMockModal;

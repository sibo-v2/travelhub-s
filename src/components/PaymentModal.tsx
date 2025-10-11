import { useState } from 'react';
import { X, CreditCard, Lock, Calendar, User } from 'lucide-react';
import { PaymentDetails } from '../services/bookingService';

interface PaymentModalProps {
  amount: number;
  serviceName: string;
  onConfirm: (paymentDetails: PaymentDetails) => void;
  onCancel: () => void;
}

export function PaymentModal({ amount, serviceName, onConfirm, onCancel }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'wallet'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      if (value.length >= 2) {
        setExpiryDate(value.slice(0, 2) + '/' + value.slice(2));
      } else {
        setExpiryDate(value);
      }
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const getCardType = (number: string): string => {
    const firstDigit = number.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    return 'Card';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const paymentDetails: PaymentDetails = {
      amount,
      paymentMethod,
      cardLastFour: cardNumber.slice(-4),
      cardType: getCardType(cardNumber),
    };

    onConfirm(paymentDetails);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-sky-600 to-emerald-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Complete Payment</h2>
            <p className="text-sm opacity-90">{serviceName}</p>
          </div>
          <button
            onClick={onCancel}
            className="hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-sky-200 dark:border-sky-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${amount.toFixed(2)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-full p-3">
                <Lock className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'debit_card', label: 'Debit Card' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'wallet', label: 'Digital Wallet' },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === method.value
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="font-medium text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formatCardNumber(cardNumber)}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'paypal' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You will be redirected to PayPal to complete your payment securely.
              </p>
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Connect your digital wallet to complete the payment.
              </p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lock className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Secure Payment</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Your payment information is encrypted and secure. We never store your full card details.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-sky-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

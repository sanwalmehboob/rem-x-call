import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('This email is not registered');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      navigate('/otp-verification', { state: { email: email.trim() } });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-10">
        <Logo />
        <h1 className="text-[32px] font-[790] leading-[28px] tracking-[-0.04em] text-[#1a1a1a] mb-3 font-['SF_Compact',_system-ui,_sans-serif]">Forgot Password?</h1>
        <p className="text-[15px] text-gray-500 font-medium">Enter your email to reset your password</p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Email</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className={`h-4 w-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
             </div>
             <input
                type="text"
                className={`block w-full pl-10 pr-3 py-3 border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-[#C8F1BE] focus:border-[#C8F1BE]'} rounded-xl text-sm bg-gray-50/50 transition-all`}
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
             />
          </div>
          {error && <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-8 bg-gradient-to-r from-[#ADF808] to-[#5AD43D] hover:opacity-90 text-[#1c4714] font-bold text-[15px] py-3.5 px-4 rounded-xl transition duration-200 ease-in-out disabled:opacity-60 shadow-sm"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;

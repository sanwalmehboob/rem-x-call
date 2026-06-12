import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';

const PW_RESET_TOKEN_KEY = 'remxcall_pw_reset_token';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(PW_RESET_TOKEN_KEY)) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const resetToken = sessionStorage.getItem(PW_RESET_TOKEN_KEY);
    if (!resetToken) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { resetToken, newPassword });
      sessionStorage.removeItem(PW_RESET_TOKEN_KEY);
      navigate('/password-success');
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
        <h1 className="text-[32px] font-[790] leading-[28px] tracking-[-0.04em] text-[#1a1a1a] mb-3 font-['SF_Compact',_system-ui,_sans-serif]">Change Password</h1>
        <p className="text-[15px] text-gray-500 font-medium">Enter your new password to update.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
           <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">New Password</label>
           <div className="relative">
             <input
               type={showNewPassword ? 'text' : 'password'}
               className={`block w-full px-3.5 py-3 border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-[#C8F1BE] focus:border-[#C8F1BE]'} rounded-xl text-sm bg-gray-50/50 transition-all`}
               placeholder="* * * * * * *"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
             />
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
               <button
                 type="button"
                 onClick={() => setShowNewPassword(!showNewPassword)}
                 className="text-gray-400 hover:text-gray-600 focus:outline-none"
               >
                 {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
               </button>
             </div>
           </div>
        </div>

        <div>
           <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Confirm Password</label>
           <div className="relative">
             <input
               type={showConfirmPassword ? 'text' : 'password'}
               className={`block w-full px-3.5 py-3 border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-[#C8F1BE] focus:border-[#C8F1BE]'} rounded-xl text-sm bg-gray-50/50 transition-all`}
               placeholder="* * * * * * *"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
             />
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
               <button
                 type="button"
                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                 className="text-gray-400 hover:text-gray-600 focus:outline-none"
               >
                 {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
               </button>
             </div>
           </div>
           {error && <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-8 bg-gradient-to-r from-[#ADF808] to-[#5AD43D] hover:opacity-90 text-[#1c4714] font-bold text-[15px] py-3.5 px-4 rounded-xl transition duration-200 ease-in-out disabled:opacity-60 shadow-sm"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;

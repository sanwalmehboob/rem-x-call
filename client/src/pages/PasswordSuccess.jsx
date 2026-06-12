import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PasswordSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full text-center animate-in fade-in zoom-in duration-300 flex flex-col items-center">
      <div className="w-16 h-16 bg-[#C8F1BE] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#aae19d]/50">
        <Check className="h-8 w-8 text-[#1c4714]" strokeWidth={3} />
      </div>
      
      <h1 className="text-[32px] font-[790] leading-[28px] tracking-[-0.04em] text-[#1a1a1a] mb-4 font-['SF_Compact',_system-ui,_sans-serif]">Password Changed Successfully</h1>
      <p className="text-[15px] text-gray-500 font-medium mb-10 max-w-[280px] leading-relaxed">
        Congratulations! Your password has been updated successfully.
      </p>

      <button
        onClick={() => navigate('/login')}
        className="w-full max-w-[200px] bg-gradient-to-r from-[#ADF808] to-[#5AD43D] hover:opacity-90 text-[#1c4714] font-bold text-[15px] py-3.5 px-4 rounded-xl transition duration-200 ease-in-out shadow-sm"
      >
        Back to Login
      </button>
    </div>
  );
};

export default PasswordSuccess;

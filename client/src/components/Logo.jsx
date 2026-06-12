import React from 'react';

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center mb-6 ${className}`}>
      {/* 
        This will display a broken image until you export 'logo.svg' from Figma 
        and place it in the public folder. It ensures pixel perfect logo rendering!
      */}
      <img src="/logo.svg" alt="RemXCall Logo" className="h-10 w-auto" />
    </div>
  );
};

export default Logo;

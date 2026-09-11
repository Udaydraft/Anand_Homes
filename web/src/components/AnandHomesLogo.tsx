import React from 'react';

interface AnandHomesLogoProps {
  collapsed?: boolean;
  light?: boolean;
  className?: string;
}

export const AnandHomesLogo: React.FC<AnandHomesLogoProps> = ({ collapsed = false, className = '' }) => {
  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md flex items-center justify-center overflow-hidden border border-white/20">
          <img
            src="/logo.jpg"
            alt="Anand Homes"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      <div className="bg-white rounded-2xl p-2 shadow-lg border border-white/20 flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-102">
        <img
          src="/logo.jpg"
          alt="Anand Homes - Dream • Develop • Deliver"
          className="h-16 w-auto max-w-[170px] object-contain"
        />
      </div>
    </div>
  );
};


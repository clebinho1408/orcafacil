
import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

const Logo: React.FC<Props> = ({ className = "w-10 h-10", size = 100 }) => {
  return (
    <div className={`${className} flex-shrink-0`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Fundo Azul com cantos arredondados (Squircle) */}
        <rect width="100" height="100" rx="25" fill="#2B59C3"/>
        
        {/* Ondas Sonoras Esquerdas */}
        <path 
          d="M28.5 37.5C26 42.5 26 57.5 28.5 62.5" 
          stroke="#93C5FD" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        <path 
          d="M19.5 32.5C15 40 15 60 19.5 67.5" 
          stroke="#93C5FD" 
          strokeWidth="6" 
          strokeOpacity="0.6" 
          strokeLinecap="round"
        />
        
        {/* Ondas Sonoras Direitas */}
        <path 
          d="M71.5 37.5C74 42.5 74 57.5 71.5 62.5" 
          stroke="#93C5FD" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        <path 
          d="M80.5 32.5C85 40 85 60 80.5 67.5" 
          stroke="#93C5FD" 
          strokeWidth="6" 
          strokeOpacity="0.6" 
          strokeLinecap="round"
        />
        
        {/* Símbolo do Cifrão Amarelo */}
        <text 
          x="50" 
          y="52" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fill="#FDE047" 
          fontSize="58" 
          fontWeight="900" 
          fontFamily="Arial, sans-serif"
          style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.2))' }}
        >
          $
        </text>
      </svg>
    </div>
  );
};

export default Logo;

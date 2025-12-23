import React from "react";
import { useTranslations } from "next-intl";
const Preloader: React.FC = () => {
  const t =useTranslations();
  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen  text-fg font-sans transition-colors duration-300">
      <div className="text-center max-w-[20em] w-full">
        
        {/* SVG Konteyner */}
        <svg
          className="block mx-auto mb-6 w-32 h-32"
          role="img"
          aria-label="Shopping cart line animation"
          viewBox="0 0 128 128"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          >
            
            <g className="stroke-track">
              <polyline points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" />
              <circle cx="43" cy="111" r="13" />
              <circle cx="102" cy="111" r="13" />
            </g>

           
            <g className="stroke-primary animate-cartLines">
              <polyline
                className="animate-cartTop"
                points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80"
                strokeDasharray="338 338"
                strokeDashoffset="-338"
              />
              
              <g className="animate-cartWheel1">
                <circle
                  className="animate-cartWheelStroke"
                  cx="43"
                  cy="111"
                  r="13"
                  strokeDasharray="81.68 81.68"
                  strokeDashoffset="81.68"
                />
              </g>
              
              <g className="animate-cartWheel2">
                <circle
                  className="animate-cartWheelStroke"
                  cx="102"
                  cy="111"
                  r="13"
                  strokeDasharray="81.68 81.68"
                  strokeDashoffset="81.68"
                />
              </g>
            </g>
          </g>
        </svg>

       
        <div className="relative h-6">
          <p className="absolute w-full animate-msg text-lg">
            {t('loading')}
          </p>
          {/* <p className="absolute w-full opacity-0 invisible animate-msgLast text-lg">
            This is taking long. Something’s wrong.
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Preloader;
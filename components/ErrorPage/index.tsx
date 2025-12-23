"use client";

import React, { useEffect, useState } from "react";

// Google Fonts'u içe aktarmak için bileşen dışına ekliyoruz
const fontImport = `
  @import url('https://fonts.googleapis.com/css?family=Encode+Sans+Semi+Condensed:100,200,300,400');
  
  @keyframes clockwise {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes anticlockwise {
    0% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes clockwiseError {
    0% { transform: rotate(0deg); }
    20% { transform: rotate(30deg); }
    40% { transform: rotate(25deg); }
    60% { transform: rotate(30deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes anticlockwiseError {
    0% { transform: rotate(0deg); }
    20% { transform: rotate(-30deg); }
    40% { transform: rotate(-25deg); }
    60% { transform: rotate(-30deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes anticlockwiseErrorStop {
    0% { transform: rotate(0deg); }
    20% { transform: rotate(-30deg); }
    60% { transform: rotate(-30deg); }
    100% { transform: rotate(0deg); }
  }
`;

export default function ErrorPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start  overflow-hidden font-['Encode_Sans_Semi_Condensed',_sans-serif]">
      {/* CSS Animasyonlarını buraya gömüyoruz */}
      <style dangerouslySetInnerHTML={{ __html: fontImport }} />

      <h1
        className={`text-[10rem] leading-[10rem] font-extralight text-black transition-all duration-500 ease-linear
          ${isLoading ? "mt-0 opacity-0" : "mt-[100px] opacity-100"}`}
      >
        500
      </h1>

      <h2
        className={`text-[1.5rem] font-extralight text-black mt-5 mb-[30px] transition-all duration-500 ease-linear
          ${isLoading ? "mt-0 opacity-0" : "opacity-100"}`}
      >
        Unexpected Error <b className="font-bold">:(</b>
      </h2>

      <div className="relative w-auto h-0">
        {/* Gear One */}
        <div
          className="relative w-[120px] h-[120px] rounded-full bg-black mx-auto -left-[130px]
          before:content-[''] before:absolute before:inset-[5px] before:bg-[#eaeaea] before:rounded-full before:z-20
          after:content-[''] after:absolute after:inset-[25px] after:border-[5px] after:border-black after:rounded-full after:z-30 after:bg-[#eaeaea]"
          style={{
            animation: isLoading
              ? "clockwise 3s linear infinite"
              : "anticlockwiseErrorStop 2s linear infinite",
          }}
        >
          <GearBars />
        </div>

        {/* Gear Two */}
        <div
          className="relative w-[120px] h-[120px] rounded-full bg-black mx-auto -top-[75px]
          before:content-[''] before:absolute before:inset-[5px] before:bg-[#eaeaea] before:rounded-full before:z-20
          after:content-[''] after:absolute after:inset-[25px] after:border-[5px] after:border-black after:rounded-full after:z-30 after:bg-[#eaeaea]"
          style={{
            animation: isLoading
              ? "anticlockwise 3s linear infinite"
              : "anticlockwiseError 2s linear infinite",
          }}
        >
          <GearBars />
        </div>

        {/* Gear Three */}
        <div
          className="relative w-[120px] h-[120px] rounded-full bg-black mx-auto -top-[235px] left-[130px]
          before:content-[''] before:absolute before:inset-[5px] before:bg-[#eaeaea] before:rounded-full before:z-20
          after:content-[''] after:absolute after:inset-[25px] after:border-[5px] after:border-black after:rounded-full after:z-30 after:bg-[#eaeaea]"
          style={{
            animation: isLoading
              ? "clockwise 3s linear infinite"
              : "clockwiseError 2s linear infinite",
          }}
        >
          <GearBars />
        </div>
      </div>
    </div>
  );
}

// Dişli çubukları için yardımcı bileşen
function GearBars() {
  return (
    <>
      <div className="absolute left-[-15px] top-1/2 w-[150px] h-[30px] -mt-[15px] rounded-[5px] bg-black z-0 before:content-[''] before:absolute before:inset-[5px] before:bg-[#eaeaea] before:rounded-[2px] before:z-[1]" />
      <div
        className="absolute left-[-15px] top-1/2 w-[150px] h-[30px] -mt-[15px] rounded-[5px] bg-black z-0 rotate-60 before:content-[''] before:absolute before:inset-[5px] before:bg-[#eaeaea] before:rounded-[2px] before:z-[1]"
        style={{ transform: "rotate(60deg)" }}
      />
      <div
        className="absolute left-[-15px] top-1/2 w-[150px] h-[30px] -mt-[15px] rounded-[5px] bg-black z-0 rotate-120 before:content-[''] before:absolute before:inset-[5px] before:bg-[#eaeaea] before:rounded-[2px] before:z-[1]"
        style={{ transform: "rotate(120deg)" }}
      />
    </>
  );
}

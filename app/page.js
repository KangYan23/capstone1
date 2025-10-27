"use client";
import { AuroraBackground } from "../components/ui/aurora-background";
import { SlideButton } from "../components/slide-button";

export default function Home() {
  const handleGetStarted = () => {
    // Add your navigation logic here
    console.log("Get Started clicked!");
  };

  return (
    <AuroraBackground>
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 max-w-4xl mx-auto">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-black dark:text-black mb-8 leading-tight">
          Smart Referral System
          <br />
          for Radiological
          <br />
          Examination
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl dark:text-zinc-300 text-zinc-700 mb-12 max-w-2xl">
          Revolutionizing medical imaging with AI-powered referral management, 
          streamlined workflows, and enhanced diagnostic accuracy.
        </p>

        {/* Get Start Slide Button */}
        <div className="flex justify-center">
          <SlideButton 
            onClick={handleGetStarted}
            className="bg-black hover:bg-gray-800 text-white"
          />
        </div>
      </div>
    </AuroraBackground>
  );
}
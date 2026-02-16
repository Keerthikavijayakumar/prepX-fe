"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface HeroIllustrationProps {
  className?: string;
}

function HeroIllustrationComponent({ className = "" }: HeroIllustrationProps) {
  return (
    <div className={`relative w-full max-w-3xl mx-auto ${className}`}>
      <svg
        viewBox="0 0 900 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="PrepX AI Interview Platform illustration showing a candidate in a virtual interview with an AI interviewer panel"
      >
        <defs>
          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--background)" />
            <stop offset="100%" stopColor="var(--muted)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background ambient shapes */}
        <motion.ellipse
          cx="200" cy="225" rx="180" ry="160"
          fill="url(#primaryGrad)"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse
          cx="700" cy="200" rx="150" ry="130"
          fill="url(#emeraldGrad)"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Main Interview Screen/Window */}
        <g transform="translate(150, 50)">
          {/* Browser window frame */}
          <rect x="0" y="0" width="600" height="350" rx="12" className="fill-card stroke-border" strokeWidth="2" />
          
          {/* Browser header bar */}
          <rect x="0" y="0" width="600" height="32" rx="12" className="fill-muted" />
          <rect x="0" y="20" width="600" height="12" className="fill-muted" />
          
          {/* Window controls */}
          <circle cx="20" cy="16" r="5" className="fill-red-400" />
          <circle cx="40" cy="16" r="5" className="fill-yellow-400" />
          <circle cx="60" cy="16" r="5" className="fill-emerald-400" />
          
          {/* URL bar */}
          <rect x="100" y="8" width="400" height="16" rx="4" className="fill-background/80" />
          <text x="120" y="20" className="fill-muted-foreground text-[10px]" fontFamily="monospace">PrepX.io/interview</text>

          {/* Video call interface */}
          <rect x="12" y="44" width="576" height="294" rx="8" className="fill-background" />

          {/* AI Interviewer Panel - Main video */}
          <g transform="translate(20, 52)">
            <rect x="0" y="0" width="340" height="220" rx="8" className="fill-muted/50 stroke-border/50" strokeWidth="1" />
            
            {/* AI Avatar */}
            <motion.g
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* AI Head - Friendly circular design */}
              <circle cx="170" cy="90" r="55" className="fill-primary/10 stroke-primary/30" strokeWidth="2" />
              <circle cx="170" cy="90" r="45" className="fill-card stroke-primary/50" strokeWidth="2" />
              
              {/* AI Eyes - Friendly expression */}
              <motion.g
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              >
                <ellipse cx="150" cy="85" rx="10" ry="12" className="fill-primary" />
                <ellipse cx="190" cy="85" rx="10" ry="12" className="fill-primary" />
                <circle cx="153" cy="82" r="4" className="fill-white/90" />
                <circle cx="193" cy="82" r="4" className="fill-white/90" />
              </motion.g>
              
              {/* AI Smile */}
              <path d="M150 105 Q170 120 190 105" stroke="var(--primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
              
              {/* Signal waves - AI speaking indicator */}
              <motion.g
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M230 75 Q245 90 230 105" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M240 65 Q260 90 240 115" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.4" />
                <path d="M250 55 Q275 90 250 125" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.2" />
              </motion.g>
            </motion.g>
            
            {/* AI Name tag */}
            <rect x="120" y="160" width="100" height="24" rx="4" className="fill-primary/10" />
            <text x="170" y="176" textAnchor="middle" className="fill-primary text-[11px] font-medium">AI Interviewer</text>
            
            {/* Live indicator */}
            <g transform="translate(10, 10)">
              <rect x="0" y="0" width="50" height="20" rx="4" className="fill-red-500/90" />
              <motion.circle
                cx="12" cy="10" r="4"
                className="fill-white"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <text x="30" y="14" textAnchor="middle" className="fill-white text-[9px] font-semibold">LIVE</text>
            </g>

            {/* Question display area */}
            <rect x="10" y="190" width="320" height="24" rx="4" className="fill-muted/80" />
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <rect x="20" y="198" width="180" height="8" rx="2" className="fill-foreground/30" />
            </motion.g>
          </g>

          {/* Candidate video - smaller, bottom right */}
          <g transform="translate(380, 52)">
            <rect x="0" y="0" width="188" height="140" rx="8" className="fill-muted/30 stroke-border/50" strokeWidth="1" />
            
            {/* Candidate silhouette */}
            <circle cx="94" cy="50" r="28" className="fill-secondary" />
            <ellipse cx="94" cy="100" rx="40" ry="35" className="fill-secondary" />
            
            {/* Candidate label */}
            <rect x="54" y="115" width="80" height="20" rx="4" className="fill-background/80" />
            <text x="94" y="129" textAnchor="middle" className="fill-foreground text-[10px]">You</text>
            
            {/* Mic indicator */}
            <g transform="translate(160, 10)">
              <circle cx="0" cy="0" r="12" className="fill-emerald-500/20" />
              <motion.rect
                x="-4" y="-8" width="8" height="12" rx="2"
                className="fill-emerald-500"
                animate={{ scaleY: [0.6, 1, 0.6] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <rect x="-6" y="6" width="12" height="2" rx="1" className="fill-emerald-500" />
            </g>
          </g>

          {/* Interview metrics panel */}
          <g transform="translate(380, 200)">
            <rect x="0" y="0" width="188" height="130" rx="8" className="fill-muted/20 stroke-border/30" strokeWidth="1" />
            
            {/* Panel header */}
            <text x="12" y="20" className="fill-foreground text-[10px] font-semibold">Interview Progress</text>
            
            {/* Progress bar */}
            <rect x="12" y="32" width="164" height="6" rx="3" className="fill-muted" />
            <motion.rect
              x="12" y="32" width="82" height="6" rx="3"
              className="fill-emerald-500"
              animate={{ width: [60, 100, 60] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Stats */}
            <text x="12" y="58" className="fill-muted-foreground text-[9px]">Time Elapsed</text>
            <text x="12" y="72" className="fill-foreground text-[11px] font-medium">12:34</text>
            
            <text x="100" y="58" className="fill-muted-foreground text-[9px]">Questions</text>
            <text x="100" y="72" className="fill-foreground text-[11px] font-medium">3 of 8</text>
            
            {/* Feedback indicators */}
            <text x="12" y="95" className="fill-muted-foreground text-[9px]">Real-time Feedback</text>
            <g transform="translate(12, 102)">
              <rect x="0" y="0" width="50" height="16" rx="3" className="fill-emerald-500/20" />
              <text x="25" y="11" textAnchor="middle" className="fill-emerald-600 text-[8px]">Clear</text>
              
              <rect x="56" y="0" width="55" height="16" rx="3" className="fill-primary/20" />
              <text x="83" y="11" textAnchor="middle" className="fill-primary text-[8px]">Confident</text>
              
              <rect x="117" y="0" width="55" height="16" rx="3" className="fill-amber-500/20" />
              <text x="144" y="11" textAnchor="middle" className="fill-amber-600 text-[8px]">Detailed</text>
            </g>
          </g>

          {/* Control bar at bottom */}
          <g transform="translate(200, 355)">
            <rect x="0" y="0" width="200" height="36" rx="18" className="fill-muted/80" />
            
            {/* Mic button */}
            <circle cx="35" cy="18" r="14" className="fill-card stroke-border" strokeWidth="1" />
            <rect x="31" y="10" width="8" height="12" rx="2" className="fill-foreground/70" />
            <rect x="29" y="24" width="12" height="2" rx="1" className="fill-foreground/70" />
            
            {/* Camera button */}
            <circle cx="75" cy="18" r="14" className="fill-card stroke-border" strokeWidth="1" />
            <rect x="65" y="12" width="20" height="12" rx="2" className="fill-foreground/70" />
            <circle cx="75" cy="18" r="4" className="fill-card" />
            
            {/* End call button */}
            <circle cx="125" cy="18" r="14" className="fill-red-500" />
            <rect x="117" y="15" width="16" height="6" rx="2" className="fill-white" />
            
            {/* More options */}
            <circle cx="165" cy="18" r="14" className="fill-card stroke-border" strokeWidth="1" />
            <circle cx="158" cy="18" r="2" className="fill-foreground/70" />
            <circle cx="165" cy="18" r="2" className="fill-foreground/70" />
            <circle cx="172" cy="18" r="2" className="fill-foreground/70" />
          </g>
        </g>

        {/* Floating feature badges */}
        <motion.g
          transform="translate(50, 320)"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="0" y="0" width="90" height="28" rx="14" className="fill-card stroke-primary/30" strokeWidth="1" filter="url(#glow)" />
          <circle cx="16" cy="14" r="8" className="fill-primary/20" />
          <text x="14" y="17" textAnchor="middle" className="fill-primary text-[10px]">🎯</text>
          <text x="55" y="18" textAnchor="middle" className="fill-foreground text-[9px] font-medium">Tailored</text>
        </motion.g>

        <motion.g
          transform="translate(50, 360)"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <rect x="0" y="0" width="100" height="28" rx="14" className="fill-card stroke-emerald-500/30" strokeWidth="1" filter="url(#glow)" />
          <circle cx="16" cy="14" r="8" className="fill-emerald-500/20" />
          <text x="14" y="17" textAnchor="middle" className="fill-emerald-500 text-[10px]">⚡</text>
          <text x="58" y="18" textAnchor="middle" className="fill-foreground text-[9px] font-medium">Real-time</text>
        </motion.g>

        <motion.g
          transform="translate(760, 320)"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <rect x="0" y="0" width="85" height="28" rx="14" className="fill-card stroke-blue-500/30" strokeWidth="1" filter="url(#glow)" />
          <circle cx="16" cy="14" r="8" className="fill-blue-500/20" />
          <text x="14" y="17" textAnchor="middle" className="fill-blue-500 text-[10px]">🤖</text>
          <text x="52" y="18" textAnchor="middle" className="fill-foreground text-[9px] font-medium">AI-Powered</text>
        </motion.g>

        <motion.g
          transform="translate(760, 360)"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <rect x="0" y="0" width="95" height="28" rx="14" className="fill-card stroke-purple-500/30" strokeWidth="1" filter="url(#glow)" />
          <circle cx="16" cy="14" r="8" className="fill-purple-500/20" />
          <text x="14" y="17" textAnchor="middle" className="fill-purple-500 text-[10px]">📊</text>
          <text x="58" y="18" textAnchor="middle" className="fill-foreground text-[9px] font-medium">Analytics</text>
        </motion.g>
      </svg>
    </div>
  );
}

export const HeroIllustration = memo(HeroIllustrationComponent);

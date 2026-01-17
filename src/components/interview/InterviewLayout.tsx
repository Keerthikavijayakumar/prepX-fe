'use client';

import type { ReactNode } from "react";
import { memo, useMemo } from "react";
import Image from "next/image";
import { 
  Captions, 
  CaptionsOff,
  Mic, 
  MicOff, 
  PhoneOff, 
  Settings, 
  Video, 
  VideoOff,
  Clock,
  Sparkles,
  Volume2,
  User,
  Bot,
  Sun,
  Moon,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type DeviceOption = {
  id: string;
  label: string;
};

export type ParticipantTile = {
  id: string;
  name: string;
  role?: "candidate" | "ai" | "other";
  isLocal?: boolean;
  isSpeaking?: boolean;
  hasAudio?: boolean;
  hasVideo?: boolean;
  video?: ReactNode;
};

export type InterviewLayoutProps = {
  roomLabel?: string;
  roundLabel?: string;
  elapsedTime?: string;
  tiles: ParticipantTile[];
  micOn: boolean;
  camOn: boolean;
  ccOn: boolean;
  settingsOpen: boolean;
  subtitleItems: { id: string; speaker: string; text: string }[];
  audioLevel?: number; // 0-100 for mic input level
  onToggleMic?: () => void;
  onToggleCam?: () => void;
  onToggleCc?: () => void;
  onOpenSettings?: () => void;
  onCloseSettings?: () => void;
  onEndCall?: () => void;
  micDevices?: DeviceOption[];
  cameraDevices?: DeviceOption[];
  speakerDevices?: DeviceOption[];
  selectedMicId?: string;
  selectedCameraId?: string;
  selectedSpeakerId?: string;
  onSelectMicDevice?: (id: string) => void;
  onSelectCameraDevice?: (id: string) => void;
  onSelectSpeakerDevice?: (id: string) => void;
  // End confirmation dialog
  showEndConfirmDialog?: boolean;
  onEndConfirm?: () => void;
  onEndCancel?: () => void;
  endingSession?: boolean;
  // Agent connection status
  agentConnected?: boolean;
};

// Memoized participant tile for performance
const ParticipantTileComponent = memo(function ParticipantTileComponent({ 
  tile, 
  micOn, 
  camOn,
  isMainTile = false
}: { 
  tile: ParticipantTile; 
  micOn: boolean; 
  camOn: boolean;
  isMainTile?: boolean;
}) {
  const isCandidate = tile.role === "candidate" || tile.isLocal;
  const isAI = tile.role === "ai";
  const speaking = !!tile.isSpeaking;
  let hasAudio = isCandidate ? micOn : tile.hasAudio ?? true;
  const hasVideo = isCandidate ? camOn : tile.hasVideo ?? !!tile.video;
  
  if (!hasAudio && speaking) {
    hasAudio = true;
  }
  const muted = !hasAudio;

  const initials = tile.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300",
        isMainTile ? "h-full" : "h-full min-h-[200px]",
        speaking 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/20" 
          : "ring-1 ring-border",
        // Theme-aware backgrounds
        isAI && "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
        !isAI && "bg-muted dark:bg-slate-900"
      )}
    >
      {/* Participant info badge */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors",
          speaking 
            ? "bg-primary text-primary-foreground" 
            : "bg-background/80 dark:bg-black/60 text-foreground dark:text-white border border-border dark:border-white/10"
        )}>
          {isAI ? (
            <Bot className="h-3.5 w-3.5" />
          ) : (
            <User className="h-3.5 w-3.5" />
          )}
          <span>{isCandidate ? "You" : tile.name}</span>
        </div>
        
        {/* Audio indicator */}
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all",
          muted 
            ? "bg-red-500 text-white" 
            : speaking 
              ? "bg-emerald-500 text-white animate-pulse" 
              : "bg-background/80 dark:bg-black/60 text-muted-foreground border border-border dark:border-white/10"
        )}>
          {muted ? (
            <MicOff className="h-3.5 w-3.5" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
        </div>
      </div>

      {/* Video / Avatar area */}
      <div className="relative flex-1 overflow-hidden">
        <div className={cn(
          "flex h-full w-full items-center justify-center",
          "[&>video]:h-full [&>video]:w-full [&>video]:object-cover"
        )}>
          {tile.video && hasVideo ? (
            tile.video
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              {/* Avatar */}
              <div className={cn(
                "flex items-center justify-center rounded-full transition-all",
                isMainTile ? "h-24 w-24" : "h-16 w-16",
                isAI 
                  ? "bg-gradient-to-br from-primary to-emerald-500 shadow-lg shadow-primary/30" 
                  : "bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/20 dark:from-slate-700 dark:to-slate-600",
                speaking && "scale-105"
              )}>
                {isAI ? (
                  <Sparkles className={cn(
                    "text-white",
                    isMainTile ? "h-10 w-10" : "h-7 w-7"
                  )} />
                ) : (
                  <span className={cn(
                    "font-semibold text-foreground dark:text-white",
                    isMainTile ? "text-2xl" : "text-lg"
                  )}>
                    {initials}
                  </span>
                )}
              </div>
              
              {/* Camera off indicator for candidate */}
              {isCandidate && !hasVideo && (
                <span className="text-xs text-muted-foreground">Camera off</span>
              )}
              
              {/* AI status indicator */}
              {isAI && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    speaking ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"
                  )} />
                  {speaking ? "Speaking..." : "Listening"}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Speaking wave animation overlay */}
        {speaking && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
        )}
      </div>
    </div>
  );
});

export function InterviewLayout({
  roomLabel,
  roundLabel = "AI Practice Interview",
  elapsedTime,
  tiles,
  micOn,
  camOn,
  ccOn,
  settingsOpen,
  subtitleItems,
  onToggleMic,
  onToggleCam,
  onToggleCc,
  onOpenSettings,
  onCloseSettings,
  onEndCall,
  micDevices,
  cameraDevices,
  speakerDevices,
  selectedMicId,
  selectedCameraId,
  selectedSpeakerId,
  onSelectMicDevice,
  onSelectCameraDevice,
  onSelectSpeakerDevice,
  audioLevel = 0,
  showEndConfirmDialog = false,
  onEndConfirm,
  onEndCancel,
  endingSession = false,
  agentConnected = false,
}: InterviewLayoutProps) {
  const { theme, setTheme } = useTheme();

  // Memoize tile sorting for performance
  const sortedTiles = useMemo(() => {
    // Put AI first, then candidate
    return [...tiles].sort((a, b) => {
      if (a.role === "ai") return -1;
      if (b.role === "ai") return 1;
      if (a.isLocal) return 1;
      if (b.isLocal) return -1;
      return 0;
    });
  }, [tiles]);

  const aiTile = sortedTiles.find(t => t.role === "ai");
  const candidateTile = sortedTiles.find(t => t.isLocal || t.role === "candidate");

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
        {/* Header - Minimal and elegant */}
        <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative h-7 w-7">
              <Image
                src="/brand/icon-final.svg"
                alt="Panelroom"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground">Panelroom</h1>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-xs text-muted-foreground hidden sm:block">{roundLabel}</span>
          </div>

          {/* Timer and Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connection status indicator */}
            {agentConnected ? (
              <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-2.5 sm:px-3 py-1.5 border border-red-500/20">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </div>
                <span className="text-xs font-medium text-red-600 dark:text-red-400">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-2.5 sm:px-3 py-1.5 border border-amber-500/20">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </div>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Connecting...</span>
              </div>
            )}
            
            {/* Timer - only show when agent is connected */}
            {agentConnected && elapsedTime && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">{elapsedTime}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-8 w-8 rounded-full"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main stage - Modern split layout */}
        <main className="relative flex-1 overflow-hidden">
          {/* Background gradient - Theme aware */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,90,139,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(0,90,139,0.15),transparent_50%)]" />
          
          {/* Content */}
          <div className="relative h-full p-4 sm:p-6">
            {sortedTiles.length === 1 ? (
              // Single participant - centered
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-4xl h-[70vh]">
                  <ParticipantTileComponent tile={sortedTiles[0]!} micOn={micOn} camOn={camOn} isMainTile />
                </div>
              </div>
            ) : (
              // Two participants - side by side on desktop, stacked on mobile
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* AI Interviewer */}
                {aiTile && (
                  <div className="h-full min-h-[35vh] lg:min-h-0">
                    <ParticipantTileComponent tile={aiTile} micOn={micOn} camOn={camOn} isMainTile />
                  </div>
                )}
                
                {/* Candidate */}
                {candidateTile && (
                  <div className="h-full min-h-[35vh] lg:min-h-0">
                    <ParticipantTileComponent tile={candidateTile} micOn={micOn} camOn={camOn} isMainTile />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subtitles - Redesigned */}
          <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center px-4 sm:px-6">
            {ccOn && subtitleItems.length > 0 && (
              <div className="w-full max-w-3xl rounded-2xl bg-card/95 dark:bg-black/80 backdrop-blur-xl border border-border px-6 py-4 shadow-2xl">
                <div className="space-y-2">
                  {subtitleItems.slice(-2).map((item, index, arr) => {
                    const isLatest = index === arr.length - 1;
                    const isAI = item.speaker !== "You";
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 transition-all duration-300",
                          isLatest ? "opacity-100" : "opacity-60"
                        )}
                      >
                        <span className={cn(
                          "shrink-0 mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          isAI 
                            ? "bg-primary/20 text-primary" 
                            : "bg-emerald-500/20 text-emerald-500"
                        )}>
                          {item.speaker || (isAI ? "AI" : "You")}
                        </span>
                        <p className="text-sm leading-relaxed text-foreground">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Controls dock - Floating pill design */}
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-2xl bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border p-2 shadow-2xl">
            {/* Mic toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={onToggleMic}
                  aria-pressed={micOn}
                  aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                  className={cn(
                    "h-12 w-12 rounded-xl transition-all",
                    micOn 
                      ? "bg-muted hover:bg-muted/80 text-foreground" 
                      : "bg-red-500 hover:bg-red-600 text-white"
                  )}
                >
                  {micOn ? (
                    <Mic className="h-5 w-5" />
                  ) : (
                    <MicOff className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {micOn ? "Mute" : "Unmute"}
              </TooltipContent>
            </Tooltip>

            {/* Camera toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={onToggleCam}
                  aria-pressed={camOn}
                  aria-label={camOn ? "Turn camera off" : "Turn camera on"}
                  className={cn(
                    "h-12 w-12 rounded-xl transition-all",
                    camOn 
                      ? "bg-muted hover:bg-muted/80 text-foreground" 
                      : "bg-red-500 hover:bg-red-600 text-white"
                  )}
                >
                  {camOn ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {camOn ? "Stop video" : "Start video"}
              </TooltipContent>
            </Tooltip>

            {/* Captions toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={onToggleCc}
                  aria-pressed={ccOn}
                  aria-label={ccOn ? "Disable captions" : "Enable captions"}
                  className={cn(
                    "h-12 w-12 rounded-xl transition-all",
                    ccOn 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                >
                  {ccOn ? (
                    <Captions className="h-5 w-5" />
                  ) : (
                    <CaptionsOff className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {ccOn ? "Hide captions" : "Show captions"}
              </TooltipContent>
            </Tooltip>

            <div className="mx-1 h-8 w-px bg-border" />

            {/* Settings */}
            <Dialog
              open={settingsOpen}
              onOpenChange={(open) => {
                if (open) onOpenSettings?.();
                else onCloseSettings?.();
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      aria-haspopup="dialog"
                      aria-expanded={settingsOpen}
                      className="h-12 w-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">Settings</TooltipContent>
              </Tooltip>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Audio & Video Settings</DialogTitle>
                  <DialogDescription>
                    Configure your devices for the best interview experience.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-5">
                  {/* Microphone */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      Microphone
                    </Label>
                    <Select
                      value={selectedMicId}
                      onValueChange={(value) => onSelectMicDevice?.(value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        {(micDevices ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-100" 
                          style={{ width: `${Math.min(100, Math.max(5, audioLevel))}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-20">Input level</span>
                    </div>
                  </div>

                  {/* Camera */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      Camera
                    </Label>
                    <Select
                      value={selectedCameraId}
                      onValueChange={(value) => onSelectCameraDevice?.(value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        {(cameraDevices ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Speakers */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      Speakers
                    </Label>
                    <Select
                      value={selectedSpeakerId}
                      onValueChange={(value) => onSelectSpeakerDevice?.(value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select speakers" />
                      </SelectTrigger>
                      <SelectContent>
                        {(speakerDevices ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onCloseSettings?.()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onCloseSettings?.()}
                  >
                    Done
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mx-1 h-8 w-px bg-border" />

            {/* End call */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={onEndCall}
                  disabled={endingSession}
                  className="h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white px-5 gap-2"
                >
                  {endingSession ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PhoneOff className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline font-medium">
                    {endingSession ? "Ending..." : "End"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">End interview</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* End Confirmation Dialog */}
        <AlertDialog open={showEndConfirmDialog} onOpenChange={(open: boolean) => !open && onEndCancel?.()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                End Interview?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end this interview? Your session will be saved and you&apos;ll be redirected to view your results and feedback.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onEndCancel} disabled={endingSession}>
                Continue Interview
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onEndConfirm}
                disabled={endingSession}
                className="bg-red-500 hover:bg-red-600"
              >
                {endingSession ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ending...
                  </>
                ) : (
                  "End Interview"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

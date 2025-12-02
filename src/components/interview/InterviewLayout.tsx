'use client';

import type { ReactNode } from "react";
import { ClosedCaption, Mic, MicOff, PhoneOff, Settings, Video, VideoOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
};

export function InterviewLayout({
  roomLabel,
  roundLabel = "Technical round",
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
}: InterviewLayoutProps) {
  const tileCount = tiles.length || 1;
  const cols =
    tileCount <= 1 ? 1 : tileCount === 2 ? 2 : tileCount <= 4 ? 2 : tileCount <= 9 ? 3 : 4;
  const gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

  const renderTile = (tile: ParticipantTile) => {
    const isCandidate = tile.role === "candidate" || tile.isLocal;
    const speaking = !!tile.isSpeaking;
    let hasAudio = isCandidate ? micOn : tile.hasAudio ?? true;
    const hasVideo = isCandidate ? camOn : tile.hasVideo ?? !!tile.video;
    // If LiveKit reports the participant as speaking, treat their mic as on in the UI
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
      <Card
        key={tile.id}
        className={cn(
          "relative flex h-full min-h-0 flex-col overflow-hidden border bg-card shadow-sm py-0",
          speaking && "border-primary/70 shadow-[0_0_0_1px_rgba(0,90,139,0.7)]"
        )}
      >
        <div className="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-md border bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              muted ? "bg-zinc-400" : speaking ? "bg-emerald-500" : "bg-emerald-500/60"
            )}
          />
          <span>{isCandidate ? "You" : tile.name}</span>
          <span
            className={cn(
              "ml-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card text-[0.6rem]",
              speaking && !muted && "border-emerald-500 bg-emerald-500/10"
            )}
          >
            {muted ? (
              <MicOff className="h-2.5 w-2.5" aria-hidden="true" />
            ) : (
              <Mic
                className={cn(
                  "h-2.5 w-2.5",
                  speaking && "text-emerald-500"
                )}
                aria-hidden="true"
              />
            )}
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden bg-slate-900">
          <div
            className={cn(
              "flex h-full w-full items-center justify-center [&>video]:h-full [&>video]:w-full [&>video]:object-cover",
              isCandidate && !hasVideo && "opacity-40"
            )}
          >
            {tile.video ? (
              tile.video
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-200">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                  <span className="text-base font-semibold text-white">
                    {initials}
                  </span>
                </div>
              </div>
            )}
          </div>

          {isCandidate && (
            <div
              className={cn(
                "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs text-slate-200",
                hasVideo ? "hidden" : "flex"
              )}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <span className="text-lg font-semibold text-white">YO</span>
              </div>
              <div className="text-sm font-medium">Camera Disabled</div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(0,90,139,0.6)]" />
          <span>TalentScout.ai</span>
          {roomLabel ? (
            <span className="ml-2 text-xs text-muted-foreground">{roomLabel}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          {roundLabel ? (
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-primary"
            >
              {roundLabel}
            </Badge>
          ) : null}
          {elapsedTime ? (
            <span className="font-mono text-[0.75rem] text-muted-foreground">
              {elapsedTime}
            </span>
          ) : null}
        </div>
      </header>

      {/* Main stage */}
      <main className="relative flex-1 bg-[radial-gradient(circle_at_center,#f1f5f9_0%,hsl(var(--background))_100%)] p-3 sm:p-4">
        {tileCount === 1 ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl h-[60vh] sm:h-[65vh] lg:h-[70vh]">
              {renderTile(tiles[0]!)}
            </div>
          </div>
        ) : (
          <div className="h-[60vh] sm:h-[65vh] lg:h-[70vh]">
            <div
              className="grid h-full gap-3 [grid-auto-rows:minmax(0,1fr)]"
              style={{ gridTemplateColumns }}
            >
              {tiles.map(renderTile)}
            </div>
          </div>
        )}

        {/* Subtitles */}
        <div className="pointer-events-none fixed inset-x-0 bottom-[110px] flex justify-center px-6">
          {ccOn && subtitleItems.length > 0 && (
            <div className="w-full max-w-[720px] min-h-[3.5rem] rounded-xl border border-white/10 bg-slate-900/90 px-6 py-3 text-base text-slate-50 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] backdrop-blur-md flex flex-col justify-end">
              <div className="space-y-1.5">
                {subtitleItems
                  .slice(-2) // last two in chronological order
                  .map((item, index, arr) => {
                    const isLatest = index === arr.length - 1;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "grid grid-cols-[auto,minmax(0,1fr)] gap-3 text-sm leading-relaxed transition-all duration-300 ease-out",
                          isLatest
                            ? "opacity-100 translate-y-0"
                            : "opacity-80 -translate-y-0.5"
                        )}
                      >
                        <span className="mt-[3px] pr-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400 whitespace-nowrap">
                          {item.speaker}
                        </span>
                        <span className="min-w-0 align-middle text-[0.9rem] leading-relaxed break-words text-slate-50">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Controls dock */}
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2 shadow-lg shadow-black/20">
            <Button
              type="button"
              size="icon-lg"
              variant={micOn ? "outline" : "destructive"}
              onClick={onToggleMic}
              aria-pressed={micOn}
              aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
              className={cn(
                "h-12 w-12 rounded-full",
                !micOn && "bg-destructive text-destructive-foreground"
              )}
            >
              {micOn ? (
                <Mic className="h-5 w-5" aria-hidden="true" />
              ) : (
                <MicOff className="h-5 w-5 text-white" aria-hidden="true" />
              )}
            </Button>

            <Button
              type="button"
              size="icon-lg"
              variant={camOn ? "outline" : "destructive"}
              onClick={onToggleCam}
              aria-pressed={camOn}
              aria-label={camOn ? "Turn camera off" : "Turn camera on"}
              className={cn(
                "h-12 w-12 rounded-full",
                !camOn && "bg-destructive text-destructive-foreground"
              )}
            >
              {camOn ? (
                <Video className="h-5 w-5" aria-hidden="true" />
              ) : (
                <VideoOff className="h-5 w-5 text-white" aria-hidden="true" />
              )}
            </Button>

            <Button
              type="button"
              size="icon-lg"
              variant="outline"
              onClick={onToggleCc}
              aria-pressed={ccOn}
              aria-label={ccOn ? "Disable captions" : "Enable captions"}
              className={cn(
                // No hover animation; keep background consistent on hover
                "h-12 w-12 rounded-full transition-none hover:bg-transparent hover:text-current",
                ccOn &&
                  "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary/80 dark:border-primary/80"
              )}
            >
              <ClosedCaption className="h-5 w-5" aria-hidden="true" />
            </Button>

            <div className="mx-1 h-6 w-px bg-border" />

            <Dialog
              open={settingsOpen}
              onOpenChange={(open) => {
                if (open) {
                  onOpenSettings?.();
                } else {
                  onCloseSettings?.();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="icon-lg"
                  variant="outline"
                  aria-haspopup="dialog"
                  aria-expanded={settingsOpen}
                  className="h-12 w-12 rounded-full"
                >
                  <Settings className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DialogTrigger>

              <DialogContent className="w-full max-w-lg">
                <DialogHeader>
                  <DialogTitle>Audio &amp; Video Settings</DialogTitle>
                  <DialogDescription>
                    Configure your input devices for the interview.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4 text-xs">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Microphone</Label>
                    <Select
                      value={selectedMicId}
                      onValueChange={(value) => onSelectMicDevice?.(value)}
                    >
                      <SelectTrigger className="h-9 w-full text-xs">
                        <SelectValue
                          placeholder={
                            micDevices?.find((d) => d.id === selectedMicId)?.label ||
                            "Select microphone"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="w-full text-xs">
                        {(micDevices ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="mt-1 text-[0.7rem] text-muted-foreground">Input level</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Camera</Label>
                    <Select
                      value={selectedCameraId}
                      onValueChange={(value) => onSelectCameraDevice?.(value)}
                    >
                      <SelectTrigger className="h-9 w-full text-xs">
                        <SelectValue
                          placeholder={
                            cameraDevices?.find((d) => d.id === selectedCameraId)?.label ||
                            "Select camera"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="w-full text-xs">
                        {(cameraDevices ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Speakers</Label>
                    <Select
                      value={selectedSpeakerId}
                      onValueChange={(value) => onSelectSpeakerDevice?.(value)}
                    >
                      <SelectTrigger className="h-9 w-full text-xs">
                        <SelectValue
                          placeholder={
                            speakerDevices?.find((d) => d.id === selectedSpeakerId)?.label ||
                            "Select speakers"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="w-full text-xs">
                        {(speakerDevices ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onCloseSettings?.()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onCloseSettings?.()}
                  >
                    Done
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onEndCall}
              className="ml-1 flex h-12 items-center justify-center rounded-full px-4"
            >
              <PhoneOff className="mr-1 h-4 w-4" aria-hidden="true" />
              End
            </Button>
          </div>
        </div>

        {/* Settings handled by shadcn Dialog above */}
      </main>
    </div>
  );
}

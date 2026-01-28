"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  Building2,
  Timer,
  Zap,
  Brain,
  Check,
  Rocket,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { interviewApi, getErrorMessage, type InterviewPlan } from "@/lib/interviewClient";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MultiRangeSlider, type SectionData } from "@/components/ui/multi-range-slider";

interface InterviewConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InterviewConfig {
  complexity: "beginner" | "intermediate" | "advanced";
  duration_minutes: 15 | 30;
  target_role: string;
  target_company: string;
  job_description: string;
}

export function InterviewConfigModal({ open, onOpenChange }: InterviewConfigModalProps) {
  const router = useRouter();
  
  // Interview configuration
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>({
    complexity: "intermediate",
    duration_minutes: 30,
    target_role: "",
    target_company: "",
    job_description: "",
  });

  // Interview plan state
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [interviewPlan, setInterviewPlan] = useState<InterviewPlan | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [startingInterview, setStartingInterview] = useState(false);
  
  // Wizard step state
  const [wizardStep, setWizardStep] = useState(1);
  
  // Plan caching
  const [planInputHash, setPlanInputHash] = useState<string | null>(null);
  const autoGenerateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoGenerateCountdown, setAutoGenerateCountdown] = useState<number | null>(null);
  
  // Generate hash from current inputs
  const currentInputHash = useMemo(() => {
    return JSON.stringify({
      role: interviewConfig.target_role.trim(),
      company: interviewConfig.target_company?.trim() || '',
      job: interviewConfig.job_description?.trim() || '',
      complexity: interviewConfig.complexity,
      duration: interviewConfig.duration_minutes,
    });
  }, [interviewConfig]);
  
  // Check if inputs changed since plan was generated
  const planNeedsRegeneration = useMemo(() => {
    return interviewPlan !== null && planInputHash !== null && planInputHash !== currentInputHash;
  }, [interviewPlan, planInputHash, currentInputHash]);

  const handleGeneratePlan = useCallback(async (forceRegenerate = false) => {
    if (!interviewConfig.target_role.trim()) {
      setPlanError("Please enter a target role first");
      return;
    }
    
    if (!forceRegenerate && interviewPlan && planInputHash === currentInputHash) {
      return;
    }

    if (forceRegenerate) {
      setInterviewPlan(null);
    }
    
    setGeneratingPlan(true);
    setPlanError(null);

    try {
      const result = await interviewApi.generatePlan({
        complexity: interviewConfig.complexity,
        duration_minutes: interviewConfig.duration_minutes,
        target_role: interviewConfig.target_role.trim(),
        target_company: interviewConfig.target_company?.trim() || undefined,
        job_description: interviewConfig.job_description?.trim() || undefined,
      });

      if (!result.success || !result.plan) {
        setPlanError(result.message || "Failed to generate plan");
        return;
      }

      setInterviewPlan(result.plan);
      setPlanInputHash(currentInputHash);
    } catch (error) {
      console.error("Plan generation error:", error);
      setPlanError("Failed to generate plan. Please try again.");
    } finally {
      setGeneratingPlan(false);
    }
  }, [interviewConfig, interviewPlan, planInputHash, currentInputHash]);
  
  const handleForceRegenerate = useCallback(() => {
    handleGeneratePlan(true);
  }, [handleGeneratePlan]);
  
  // Auto-generate plan when entering step 3
  useEffect(() => {
    if (autoGenerateTimerRef.current) {
      clearTimeout(autoGenerateTimerRef.current);
      autoGenerateTimerRef.current = null;
    }
    setAutoGenerateCountdown(null);
    
    const shouldAutoGenerate = 
      wizardStep === 3 && 
      !interviewPlan && 
      !generatingPlan && 
      !planError &&
      interviewConfig.target_role.trim();
    
    if (shouldAutoGenerate) {
      let countdown = 3;
      setAutoGenerateCountdown(countdown);
      
      const countdownInterval = setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
          setAutoGenerateCountdown(countdown);
        } else {
          clearInterval(countdownInterval);
          setAutoGenerateCountdown(null);
          handleGeneratePlan();
        }
      }, 1000);
      
      autoGenerateTimerRef.current = countdownInterval as unknown as NodeJS.Timeout;
    }
    
    return () => {
      if (autoGenerateTimerRef.current) {
        clearInterval(autoGenerateTimerRef.current as unknown as NodeJS.Timeout);
        setAutoGenerateCountdown(null);
      }
    };
  }, [wizardStep, interviewPlan, generatingPlan, planError, interviewConfig.target_role, handleGeneratePlan]);
  
  // Invalidate plan when inputs change
  useEffect(() => {
    if (planNeedsRegeneration) {
      setInterviewPlan(null);
      setPlanInputHash(null);
    }
  }, [planNeedsRegeneration]);

  async function handleSubmitConfig() {
    if (!interviewConfig.target_role.trim()) {
      alert("Please enter the target role");
      return;
    }

    if (!interviewPlan) {
      alert("Please generate an interview plan first");
      return;
    }

    setStartingInterview(true);

    try {
      const result = await interviewApi.startSession({
        ...interviewConfig,
        sections: interviewPlan.sections,
      });

      if (!result.success) {
        const errorMsg = result.message || getErrorMessage(result.error || "UNKNOWN_ERROR");
        alert(errorMsg);
        setStartingInterview(false);
        return;
      }

      const { session, livekit } = result;

      if (!session || !livekit) {
        alert("Invalid response from server. Please try again.");
        setStartingInterview(false);
        return;
      }

      try {
        sessionStorage.setItem(
          `interview_${session.id}`,
          JSON.stringify({
            token: livekit.token,
            wsUrl: livekit.wsUrl,
            roomName: livekit.roomName,
            timestamp: Date.now(),
          })
        );
      } catch (storageError) {
        console.error("Failed to store session data:", storageError);
      }

      onOpenChange(false);
      router.push(`/interview/${session.id}`);
    } catch (error) {
      console.error("Failed to start interview:", error);
      const errorMsg = error instanceof Error
        ? error.message
        : "Failed to start interview. Please try again.";
      alert(errorMsg);
      setStartingInterview(false);
    }
  }

  function handleClose(newOpen: boolean) {
    if (!newOpen) {
      setInterviewPlan(null);
      setPlanError(null);
      setPlanInputHash(null);
      setWizardStep(1);
      setAutoGenerateCountdown(null);
      if (autoGenerateTimerRef.current) {
        clearInterval(autoGenerateTimerRef.current as unknown as NodeJS.Timeout);
        autoGenerateTimerRef.current = null;
      }
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-hidden p-0 gap-0"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>Configure Interview Session</DialogTitle>
        </VisuallyHidden>
        
        {/* Progress Header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                {index > 0 && (
                  <div className={`w-12 sm:w-16 h-0.5 transition-all duration-500 ${
                    wizardStep > step - 1 ? "bg-primary" : "bg-muted"
                  }`} />
                )}
                <div className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 flex-shrink-0
                  ${wizardStep > step 
                    ? "bg-primary text-primary-foreground" 
                    : wizardStep === step 
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                      : "bg-muted text-muted-foreground"
                  }
                `}>
                  {wizardStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                {index < 2 && (
                  <div className={`w-12 sm:w-16 h-0.5 transition-all duration-500 ${
                    wizardStep > step ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {wizardStep === 1 && "What role are you targeting?"}
              {wizardStep === 2 && "Configure your session"}
              {wizardStep === 3 && (
                interviewPlan 
                  ? "Your plan is ready!" 
                  : generatingPlan 
                    ? "Creating your plan..." 
                    : "Generate your plan"
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {wizardStep === 1 && "We'll tailor questions to match your target position"}
              {wizardStep === 2 && "Choose duration and difficulty level"}
              {wizardStep === 3 && (
                interviewPlan 
                  ? "Review and customize your interview sections" 
                  : generatingPlan 
                    ? "This usually takes a few seconds" 
                    : "AI will create a personalized interview plan"
              )}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6 min-h-[280px]">
          {/* Step 1: Role & Context */}
          {wizardStep === 1 && (
            <div 
              className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200"
              key="step1"
            >
              <div className="space-y-2">
                <Label className="text-sm font-medium">Target Role *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={interviewConfig.target_role}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, target_role: e.target.value })}
                    className="pl-11 h-12 text-base"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Target Company (optional)</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input
                    placeholder="e.g., Google, Meta, Stripe"
                    value={interviewConfig.target_company}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, target_company: e.target.value })}
                    className="pl-11 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Job Description (optional)</Label>
                <Textarea
                  placeholder="Paste the job description for more tailored questions..."
                  value={interviewConfig.job_description}
                  onChange={(e) => setInterviewConfig({ ...interviewConfig, job_description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {wizardStep === 2 && (
            <div 
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200"
              key="step2"
            >
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  Interview Duration
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 15, label: "15 min", desc: "Quick practice" },
                    { value: 30, label: "30 min", desc: "Full session" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setInterviewConfig({ ...interviewConfig, duration_minutes: option.value as 15 | 30 })}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        interviewConfig.duration_minutes === option.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      {interviewConfig.duration_minutes === option.value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="text-2xl font-bold text-foreground">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Difficulty Level
                </Label>
                <div className="space-y-2">
                  {[
                    { value: "beginner", label: "Beginner", desc: "Supportive feedback, foundational questions", icon: "🌱" },
                    { value: "intermediate", label: "Intermediate", desc: "Balanced challenge, industry standard", icon: "⚡" },
                    { value: "advanced", label: "Advanced", desc: "Rigorous, FAANG-level difficulty", icon: "🔥" },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setInterviewConfig({ ...interviewConfig, complexity: level.value as "beginner" | "intermediate" | "advanced" })}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        interviewConfig.complexity === level.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-2xl">{level.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.desc}</div>
                      </div>
                      {interviewConfig.complexity === level.value && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Plan Generation & Review */}
          {wizardStep === 3 && (
            <div 
              className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200"
              key="step3"
            >
              {generatingPlan && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <Spinner className="absolute inset-0 w-16 h-16" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Creating your personalized plan...</p>
                    <p className="text-sm text-muted-foreground">Analyzing your profile and role requirements</p>
                  </div>
                </div>
              )}

              {planError && !generatingPlan && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center py-8 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="h-7 w-7 text-destructive" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-destructive">Failed to generate plan</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{planError}</p>
                    </div>
                  </div>
                  <Button onClick={() => handleGeneratePlan()} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}

              {interviewPlan && !generatingPlan && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-primary">Interview Summary</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleForceRegenerate}
                        className="h-7 text-xs gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Regenerate
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-2xl font-bold text-foreground">{interviewConfig.duration_minutes}</div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Minutes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{interviewPlan.estimated_questions}</div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Questions</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-foreground">
                          {interviewConfig.complexity === 'beginner' && '🌱'}
                          {interviewConfig.complexity === 'intermediate' && '⚡'}
                          {interviewConfig.complexity === 'advanced' && '🔥'}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground capitalize">{interviewConfig.complexity}</div>
                      </div>
                    </div>
                  </div>

                  <MultiRangeSlider
                    sections={interviewPlan.sections as SectionData[]}
                    onChange={(newSections) => setInterviewPlan({ ...interviewPlan, sections: newSections })}
                    disabled={startingInterview}
                  />
                </div>
              )}

              {!interviewPlan && !generatingPlan && !planError && (
                <div className="flex flex-col items-center py-8 space-y-6">
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-primary" />
                    {autoGenerateCountdown !== null && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                        {autoGenerateCountdown}
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-medium">
                      {autoGenerateCountdown !== null 
                        ? `Generating in ${autoGenerateCountdown}...` 
                        : "Ready to create your plan"}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Our AI will analyze your profile and create a customized interview plan for <span className="font-medium text-foreground">{interviewConfig.target_role}</span>
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      if (autoGenerateTimerRef.current) {
                        clearInterval(autoGenerateTimerRef.current as unknown as NodeJS.Timeout);
                        setAutoGenerateCountdown(null);
                      }
                      handleGeneratePlan();
                    }} 
                    size="lg" 
                    className="gap-2 px-8"
                  >
                    <Sparkles className="h-5 w-5" />
                    {autoGenerateCountdown !== null ? "Generate Now" : "Generate Plan"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <div>
            {wizardStep > 1 && !startingInterview && (
              <Button
                variant="ghost"
                onClick={() => setWizardStep(wizardStep - 1)}
                disabled={generatingPlan}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {wizardStep < 3 ? (
              <Button
                onClick={() => setWizardStep(wizardStep + 1)}
                disabled={wizardStep === 1 && !interviewConfig.target_role.trim()}
                className="gap-2 min-w-[120px]"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitConfig}
                disabled={startingInterview || !interviewPlan}
                className="gap-2 min-w-[160px]"
              >
                {startingInterview ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Start Interview
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

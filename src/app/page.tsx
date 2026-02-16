"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Code2,
  BarChart3,
  Users,
  Shield,
  Target,
  Sparkles,
  Play,
  Upload,
  MessageSquare,
} from "lucide-react";
// Lazy-load the animated hero so it doesn't bloat the initial JS payload
const HeroIllustration = dynamic(() =>
  import("@/components/shared/hero-illustration").then((mod) => ({
    default: mod.HeroIllustration,
  })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[320px] w-full rounded-3xl bg-muted/50"
        aria-hidden
        role="presentation"
      />
    ),
  }
);

// Pricing plans - Simple Freemium Model
const pricingPlans = [
  {
    name: "Free",
    description: "Master interviews at your own pace",
    price: "$0",
    priceNote: "forever",
    minutes: "60 min/month",
    normalMinutes: "15 min/month",
    limitedTimeOffer: false,
    highlighted: false,
    features: [
      "2 full mock interviews per month (30 min each)",
      "Real-time AI-powered feedback",
      "FAANG company question bank",
      "Interview transcripts & recordings",
      "Performance scoring & insights",
      "Join our community of engineers",
    ],
    cta: "Get Started Free",
    badge: "",
    disabled: false,
  },
  {
    name: "Pro",
    description: "Unlimited interview practice",
    price: "$19",
    priceNote: "/month",
    minutes: "300 min/month",
    highlighted: true,
    features: [
      "10 mock interviews per month",
      "Deep AI analysis & improvement tips",
      "Full FAANG + startup question library",
      "Export transcripts & detailed reports",
      "Advanced analytics & progress tracking",
      "Priority email support",
    ],
    cta: "Join Waitlist",
    badge: "",
    disabled: true,
  },
];

// Features data - Core value propositions with magma colors
const features = [
  {
    icon: Code2,
    title: "Live Coding Interviews",
    description:
      "Solve real coding problems in a live environment. Get instant AI feedback on your approach, complexity analysis, and code quality.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "System Design Practice",
    description:
      "Tackle architecture questions like you would at FAANG. Design distributed systems with guided prompts and expert-level evaluation.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: MessageSquare,
    title: "Behavioral Mastery",
    description:
      "Perfect your STAR responses with an AI that understands what hiring managers look for. Build confidence in storytelling.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Target,
    title: "Role-Specific Prep",
    description:
      "Paste any job description and PrepX generates targeted questions matching the exact skills and experience required.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "Performance Insights",
    description:
      "Track improvement over time with detailed analytics on technical accuracy, communication clarity, and problem-solving speed.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Resume Intelligence",
    description:
      "Our AI reads your resume to ask personalized questions about your projects, tech stack, and career trajectory.",
    gradient: "from-cyan-500 to-blue-500",
  },
];

// How it works steps - Simple 3-step process
const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Your Resume",
    description:
      "PrepX's AI analyzes your experience, skills, and projects to create a personalized interview experience.",
  },
  {
    step: "02",
    icon: Play,
    title: "Enter the Interview Room",
    description:
      "Join a realistic AI-powered interview with voice interaction, just like a real video call with a hiring manager.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Review & Improve",
    description:
      "Get detailed feedback on your answers, body language cues, and areas to strengthen before your real interview.",
  },
];

export default function Home() {
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  async function handleStartClick() {
    if (startLoading) return;
    setStartLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/sign-in");
      }
    } finally {
      setStartLoading(false);
    }
  }

  function handleContactSales() {
    window.location.href = "mailto:sales@PrepX.io?subject=Enterprise%20Inquiry";
  }

  async function handleJoinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistEmail || !waitlistName) return;

    setWaitlistLoading(true);
    try {
      // Save to Supabase waitlist table
      const { supabase } = await import("@/lib/supabaseClient");
      const { error } = await supabase
        .from("waitlist")
        .insert([
          {
            email: waitlistEmail,
            name: waitlistName,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      setWaitlistSuccess(true);
      setTimeout(() => {
        setShowWaitlistModal(false);
        setWaitlistEmail("");
        setWaitlistName("");
        setWaitlistSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error joining waitlist:", error);
    } finally {
      setWaitlistLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground" style={{ backgroundImage: "url('/back.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", backgroundRepeat: "no-repeat" }}>
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.03] blur-3xl" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-12 pb-20 lg:pt-16 lg:pb-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="space-y-10">
            {/* Badge */}
            <div>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                AI-Powered Interview Prep
              </Badge>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl leading-[1.1] lg:leading-[1.1]"
            >
              Ace Your Tech Interview
              <br />
              <span className="magma-text-animated inline-block mt-2">
                with AI-Powered Practice
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="mx-auto max-w-2xl text-xl text-muted-foreground/90 sm:text-2xl leading-relaxed font-light"
            >
              Master behavioral, technical, and system design interviews with personalized AI coaching that adapts to your experience level.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleStartClick}
                disabled={startLoading}
                className="btn-magma group h-14 px-10 text-lg font-semibold rounded-xl shadow-2xl"
              >
                Start Your Free Interview
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="btn-glass-magma h-14 px-10 text-lg font-medium rounded-xl border-2"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-base text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="font-medium">Free to start</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="font-medium">Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="font-medium">No credit card required</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="mt-16 lg:mt-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <HeroIllustration className="opacity-90 rounded-2xl" />
            </div>
          </div>


        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="relative border-t border-border/50 py-20 lg:py-28 bg-gradient-to-br from-background via-muted/20 to-background"
      >
        {/* Decorative thermal orb */}
        <div className="thermal-orb thermal-orb-top-left" />

        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-12">
            {/* Section header */}
            <div className="text-center space-y-5">
              <Badge variant="outline" className="text-xs uppercase tracking-widest font-semibold px-4 py-1.5">
                Why PrepX
              </Badge>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Everything you need to succeed
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground/80 leading-relaxed">
                Built by engineers who&apos;ve been through hundreds of tech interviews.
                Every feature is designed to help you perform your best when it matters.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div key={i}>
                  <Card className="card-magma-accent group h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-5 pb-4">
                      <div className="inline-flex w-fit rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5">
                        <div className="rounded-[14px] bg-background p-3">
                          <feature.icon className={`h-7 w-7 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold group-hover:text-foreground transition-colors">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base text-muted-foreground/80 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        className="relative border-t border-border/50 py-20 lg:py-28 overflow-hidden"
      >
        {/* Grid background layer */}
        <div className="grid-layer opacity-20" />

        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-12">
            {/* Section header */}
            <div className="text-center space-y-5">
              <Badge variant="outline" className="text-xs uppercase tracking-widest font-semibold px-4 py-1.5">
                How It Works
              </Badge>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Get started in 3 simple steps
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground/80 leading-relaxed">
                No complex setup or lengthy tutorials. Start practicing immediately.
              </p>
            </div>

            {/* Steps */}
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="relative"
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
                  )}
                  <div className="card-glass p-8 rounded-2xl text-center h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="relative inline-flex mb-6">
                      <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
                        <step.icon className="h-12 w-12 text-primary" />
                      </div>
                      <span className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-lg">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-base text-muted-foreground/80 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        ref={pricingRef}
        className="relative border-t border-border/50 py-20 lg:py-28 bg-gradient-to-br from-muted/30 via-background to-muted/40 overflow-hidden"
      >
        {/* Decorative thermal orb */}
        <div className="thermal-orb thermal-orb-bottom-right" />

        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-12">
            {/* Section header */}
            <div className="text-center space-y-5">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-widest font-semibold px-4 py-1.5"
              >
                Pricing
              </Badge>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Interview prep designed for serious learners
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground/80 leading-relaxed">
                Free forever tier available. Start practicing with unlimited AI feedback today.
              </p>
            </div>

            {/* Pricing cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
              {pricingPlans.map((plan, i) => (
                <div key={i}>
                  <Card
                    className={`relative h-full flex flex-col rounded-2xl transition-all duration-500 ${plan.highlighted
                      ? "card-magma-accent shadow-2xl scale-[1.05] hover:scale-[1.06]"
                      : "card-glass hover:shadow-xl hover:-translate-y-1"
                      } ${plan.disabled ? "opacity-75" : ""}`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-3 py-1">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pt-10 pb-6">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
                      <div className="pt-6">
                        <span className="text-5xl font-extrabold">{plan.price}</span>
                        <span className="text-muted-foreground ml-2 text-lg">
                          {plan.priceNote}
                        </span>
                      </div>
                      <div className="mt-4 inline-block px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                        <span className="text-sm font-semibold text-primary">{plan.minutes}</span>
                      </div>
                      {plan.limitedTimeOffer && plan.normalMinutes && (
                        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          <p>Normally {plan.normalMinutes} • Limited time offer</p>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Button
                        className="w-full"
                        variant={plan.highlighted ? "default" : "outline"}
                        size="lg"
                        onClick={() => {
                          if (plan.disabled) {
                            setShowWaitlistModal(true);
                          } else {
                            handleStartClick();
                          }
                        }}
                        disabled={plan.disabled ? false : startLoading}
                      >
                        {plan.cta}
                        {!plan.disabled && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                <span className="text-foreground font-medium">
                  No credit card required.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative border-t border-border/50 py-24 lg:py-32 bg-gradient-to-br from-muted/30 via-background to-primary/5 overflow-hidden">
        <div className="thermal-orb thermal-orb-top-left opacity-50" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="card-glass p-12 lg:p-16 rounded-3xl space-y-8">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-4 py-1.5">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Join 1,000+ Engineers
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Start your interview prep journey.
              <br />
              <span className="magma-text">Get real feedback, not generic tips.</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground/80 leading-relaxed">
              Get 2 free mock interviews per month. Unlimited AI feedback on every response. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button
                size="lg"
                onClick={handleStartClick}
                disabled={startLoading}
                className="btn-magma group h-16 px-12 text-xl font-semibold rounded-xl shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Free forever • No credit card needed
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} PrepX. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a
                href="mailto:support@PrepX.io"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background border border-border/50 rounded-2xl shadow-2xl max-w-md w-full p-8">
            {waitlistSuccess ? (
              <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500">
                  <Check className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold">Welcome to the Waitlist!</h3>
                <p className="text-muted-foreground">
                  We'll notify you via email when Pro tier becomes available.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Join the Waitlist</h2>
                  <p className="text-muted-foreground">
                    Get early access to our Pro tier with 300 min/month and advanced features.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={waitlistName}
                      onChange={(e) => setWaitlistName(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border/50 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 btn-magma"
                    disabled={waitlistLoading || !waitlistName || !waitlistEmail}
                  >
                    {waitlistLoading ? "Joining..." : "Join Waitlist"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowWaitlistModal(false);
                      setWaitlistEmail("");
                      setWaitlistName("");
                    }}
                    disabled={waitlistLoading}
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  We'll only use your email to notify you about Pro tier launch.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

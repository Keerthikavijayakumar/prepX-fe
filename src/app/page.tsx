"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
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
import { HeroIllustration } from "@/components/shared/hero-illustration";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Pricing plans - Clear value proposition for each tier
const pricingPlans = [
  {
    name: "Free",
    description: "Explore Panelroom risk-free",
    price: "$0",
    priceNote: "forever",
    highlighted: false,
    features: [
      "3 AI mock interviews/month",
      "Behavioral & technical rounds",
      "Basic performance feedback",
      "Session transcripts",
      "Email support",
    ],
    cta: "Get Started Free",
    badge: null,
  },
  {
    name: "Pro",
    description: "Land your dream tech job faster",
    price: "$19",
    priceNote: "/month",
    highlighted: true,
    features: [
      "Unlimited AI interviews",
      "System design deep-dives",
      "Advanced analytics dashboard",
      "Job description targeting",
      "Interview recordings",
      "Priority support",
    ],
    cta: "Start 7-Day Free Trial",
    badge: "Most Popular",
  },
  {
    name: "Teams",
    description: "Scale interview prep for your org",
    price: "Custom",
    priceNote: "pricing",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Team analytics & benchmarks",
      "Candidate assessment tools",
      "Custom interview templates",
      "SSO & admin controls",
      "Dedicated success manager",
    ],
    cta: "Talk to Sales",
    badge: "For Companies",
  },
];

// Features data - Core value propositions
const features = [
  {
    icon: Code2,
    title: "Live Coding Interviews",
    description:
      "Solve real coding problems in a live environment. Get instant AI feedback on your approach, complexity analysis, and code quality.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Users,
    title: "System Design Practice",
    description:
      "Tackle architecture questions like you would at FAANG. Design distributed systems with guided prompts and expert-level evaluation.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: MessageSquare,
    title: "Behavioral Mastery",
    description:
      "Perfect your STAR responses with an AI that understands what hiring managers look for. Build confidence in storytelling.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Target,
    title: "Role-Specific Prep",
    description:
      "Paste any job description and Panelroom generates targeted questions matching the exact skills and experience required.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Performance Insights",
    description:
      "Track improvement over time with detailed analytics on technical accuracy, communication clarity, and problem-solving speed.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Shield,
    title: "Resume Intelligence",
    description:
      "Our AI reads your resume to ask personalized questions about your projects, tech stack, and career trajectory.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

// How it works steps - Simple 3-step process
const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Your Resume",
    description:
      "Panelroom's AI analyzes your experience, skills, and projects to create a personalized interview experience.",
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
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll();
  const featuresInView = useInView(featuresRef, { once: true, margin: "-50px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-50px" });
  const pricingInView = useInView(pricingRef, { once: true, margin: "-50px" });

  const y1 = useTransform(scrollYProgress, [0, 0.3], [0, -30]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  async function handleStartClick() {
    if (startLoading) return;
    setStartLoading(true);
    try {
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
    window.location.href = "mailto:sales@panelroom.io?subject=Enterprise%20Inquiry";
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:48px_48px]" />
        <motion.div
          className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.03] blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-8 pb-16 lg:pt-12 lg:pb-24">
        <motion.div
          className="mx-auto max-w-5xl px-6 text-center"
          style={{ y: y1, opacity: heroOpacity }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Now in Public Beta
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight"
            >
              Your AI Interview Coach.
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-emerald-500 bg-clip-text text-transparent">
                Practice. Improve. Get Hired.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl"
            >
              Panelroom simulates real technical interviews with AI that adapts to your resume, 
              target role, and skill level. Get instant feedback and land your dream job.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={handleStartClick}
                disabled={startLoading}
                className="group h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Start Free Interview
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 px-8 text-base"
              >
                <a href="#how-it-works">Watch Demo</a>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>No credit card needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Ready in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Works with any tech role</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 lg:mt-16"
          >
            <HeroIllustration className="opacity-90" />
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              { value: "10K+", label: "Interviews Completed" },
              { value: "95%", label: "User Satisfaction" },
              { value: "3 Types", label: "Interview Formats" },
              { value: "24/7", label: "Availability" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-foreground sm:text-3xl">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="relative border-t border-border/50 bg-muted/30 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="space-y-12"
          >
            {/* Section header */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                Why Panelroom
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Interview prep that actually works
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Built by engineers who&apos;ve been through hundreds of tech interviews. 
                Every feature is designed to help you perform your best when it matters.
              </p>
            </motion.div>

            {/* Features grid */}
            <motion.div
              variants={containerVariants}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <motion.div key={i} variants={cardVariants}>
                  <Card className="group h-full border-border/50 bg-card/80 backdrop-blur-sm transition-all hover:border-border hover:shadow-lg">
                    <CardHeader className="space-y-4">
                      <div
                        className={`inline-flex w-fit rounded-xl ${feature.bgColor} p-3`}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        className="relative border-t border-border/50 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="space-y-12"
          >
            {/* Section header */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                How It Works
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Start practicing in under 2 minutes
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                No complex setup. Upload your resume, choose your target role, 
                and jump into a realistic AI interview session.
              </p>
            </motion.div>

            {/* Steps */}
            <motion.div
              variants={containerVariants}
              className="grid gap-8 md:grid-cols-3"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  className="relative text-center"
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                  )}
                  <div className="relative inline-flex">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border/50 bg-card shadow-sm">
                      <step.icon className="h-10 w-10 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        ref={pricingRef}
        className="relative border-t border-border/50 bg-muted/30 py-20 lg:py-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            animate={pricingInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="space-y-12"
          >
            {/* Section header */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider"
              >
                Pricing
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Invest in your career
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                One successful interview can change your career trajectory. 
                Start free and upgrade when you&apos;re ready to go all-in.
              </p>
            </motion.div>

            {/* Pricing cards */}
            <motion.div
              variants={containerVariants}
              className="grid gap-6 md:grid-cols-3"
            >
              {pricingPlans.map((plan, i) => (
                <motion.div key={i} variants={cardVariants}>
                  <Card
                    className={`relative h-full flex flex-col ${
                      plan.highlighted
                        ? "border-primary shadow-xl shadow-primary/10 scale-[1.02]"
                        : "border-border/50"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-3 py-1">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pt-8">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="pt-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">
                          {plan.priceNote}
                        </span>
                      </div>
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
                        onClick={
                          plan.name === "Teams"
                            ? handleContactSales
                            : handleStartClick
                        }
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Beta notice */}
            <motion.div
              variants={itemVariants}
              className="text-center text-sm text-muted-foreground"
            >
              <p>
                All plans include full access during beta.{" "}
                <span className="text-foreground font-medium">
                  No credit card required.
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative border-t border-border/50 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to ace your next interview?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Join thousands of engineers practicing with Panelroom. Upload your
              resume and start your first AI interview in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleStartClick}
                disabled={startLoading}
                className="group h-12 px-8 text-base shadow-lg shadow-primary/20"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Panelroom. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a
                href="mailto:support@panelroom.io"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

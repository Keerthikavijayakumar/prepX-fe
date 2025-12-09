"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Home() {
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState("");
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);

  const fullText = "like the real panel.";

  const { scrollYProgress } = useScroll();
  const featuresInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });
  const pricingInView = useInView(pricingRef, { once: true, margin: "-100px" });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Smooth mouse tracking for magnetic effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothMouseY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80); // 80ms per character for smooth typing

    return () => clearInterval(typingInterval);
  }, [fullText]);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Animated background gradient */}
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Revolutionary particle system with trails - static positions to avoid hydration errors */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {[
          { x: 10, y: 20, large: false, delay: 0 },
          { x: 25, y: 15, large: false, delay: 0.5 },
          { x: 40, y: 30, large: true, delay: 1 },
          { x: 55, y: 10, large: false, delay: 1.5 },
          { x: 70, y: 25, large: false, delay: 2 },
          { x: 85, y: 18, large: true, delay: 2.5 },
          { x: 15, y: 50, large: false, delay: 0.3 },
          { x: 30, y: 60, large: false, delay: 0.8 },
          { x: 45, y: 55, large: false, delay: 1.3 },
          { x: 60, y: 65, large: true, delay: 1.8 },
          { x: 75, y: 58, large: false, delay: 2.3 },
          { x: 90, y: 70, large: false, delay: 2.8 },
          { x: 20, y: 80, large: false, delay: 0.6 },
          { x: 35, y: 85, large: false, delay: 1.1 },
          { x: 50, y: 90, large: true, delay: 1.6 },
          { x: 65, y: 82, large: false, delay: 2.1 },
          { x: 80, y: 88, large: false, delay: 2.6 },
          { x: 5, y: 40, large: false, delay: 0.4 },
          { x: 95, y: 45, large: true, delay: 0.9 },
          { x: 12, y: 75, large: false, delay: 1.4 },
        ].map((particle, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              particle.large ? "h-2 w-2 bg-primary/40" : "h-1 w-1 bg-primary/30"
            }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              filter: particle.large ? "blur(1px)" : "blur(0.5px)",
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, particle.x > 50 ? 20 : -20, 0],
              opacity: [0, 0.6, 0],
              scale: [0, particle.large ? 1.8 : 1.2, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Animated mesh gradient overlay */}
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.1) 100%)",
        }}
        animate={{
          background: [
            "radial-gradient(circle at 30% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-background via-background to-background/80"
      >
        {/* Dynamic gradient orb that follows mouse */}
        <motion.div
          className="pointer-events-none absolute -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-primary/20 via-emerald-500/20 to-sky-500/20 blur-3xl"
          style={{ x: smoothMouseX, y: smoothMouseY }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 50,
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl">
          <motion.div
            className="relative left-1/2 aspect-[1108/632] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 via-emerald-500/10 to-sky-500/30 opacity-40"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center gap-12 px-6 pb-20 pt-16 text-center lg:pb-24 lg:pt-20"
          style={{ y: y1, opacity, scale }}
        >
          <motion.div
            className="w-full space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Badge className="border-primary/30 bg-primary/10 text-xs font-medium text-primary">
                Free during beta · AI tech interview platform
              </Badge>
            </motion.div>

            <motion.h1
              className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              variants={itemVariants}
            >
              Practice tech interviews that feel
              <span className="relative inline-block">
                {/* Invisible placeholder to reserve space */}
                <span className="invisible">{fullText}</span>
                {/* Visible typed text positioned absolutely */}
                <span className="absolute left-0 top-0 bg-gradient-to-r from-primary via-emerald-500 to-sky-500 bg-clip-text text-transparent">
                  {typedText}
                  {typedText.length < fullText.length && (
                    <motion.span
                      className="inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle"
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  )}
                </span>
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto max-w-2xl text-balance text-sm text-muted-foreground sm:text-base"
              variants={itemVariants}
            >
              Upload your resume, step into an AI-powered interview room, and
              get structured feedback on how you actually perform in coding,
              system design, and behavioral rounds.
            </motion.p>

            <motion.div
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={handleStartClick}
                  disabled={startLoading}
                  className="group relative w-full overflow-hidden shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/40 sm:w-auto"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative flex items-center gap-2">
                    Start practicing
                    <motion.svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </motion.svg>
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators with animations */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-3 pt-2 text-center"
              variants={itemVariants}
            >
              <motion.div
                className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="h-2 w-2 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-emerald-400">
                  Free during beta
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <svg
                  className="h-4 w-4 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No credit card</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <svg
                  className="h-4 w-4 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Unlimited sessions</span>
              </motion.div>
            </motion.div>

            {/* Animated statistics cards */}
            <motion.div
              className="grid grid-cols-2 gap-3 pt-6 sm:gap-4 md:grid-cols-3"
              variants={containerVariants}
            >
              <motion.div
                variants={itemVariants}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <motion.div
                    className="mb-2 inline-flex rounded-lg bg-primary/10 p-2"
                    whileHover={{ rotate: 8, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </motion.div>
                  <div className="text-xl font-bold text-foreground sm:text-2xl">
                    3-step
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-sm">
                    Upload, practice, review
                  </div>
                </div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-card/80"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <motion.div
                    className="mb-2 inline-flex rounded-lg bg-emerald-500/10 p-2"
                    whileHover={{ rotate: 8, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <svg
                      className="h-5 w-5 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </motion.div>
                  <div className="text-xl font-bold text-foreground sm:text-2xl">
                    Panel-style
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-sm">
                    Real interviewer patterns
                  </div>
                </div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-sky-500/50 hover:bg-card/80 md:col-span-1 col-span-2"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <motion.div
                    className="mb-2 inline-flex rounded-lg bg-sky-500/10 p-2"
                    whileHover={{ rotate: 8, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <svg
                      className="h-5 w-5 text-sky-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </motion.div>
                  <div className="text-xl font-bold text-foreground sm:text-2xl">
                    24/7 Access
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-sm">
                    Practice anytime, anywhere
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works / features */}
      <section
        id="features"
        ref={featuresRef}
        className="relative border-b border-border/50 bg-background"
      >
        {/* Animated grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <motion.div
          className="relative mx-auto max-w-6xl space-y-8 px-6 py-12 sm:py-16 lg:py-20"
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div
            className="max-w-3xl space-y-4 text-center mx-auto"
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-xs uppercase tracking-wide text-primary"
              >
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  How it works
                </span>
              </Badge>
            </motion.div>
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              variants={itemVariants}
            >
              From resume to realistic practice
              <motion.span
                className="block bg-gradient-to-r from-primary via-emerald-500 to-sky-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                in minutes
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Panelroom turns your resume into a structured profile, spins up an
              AI interviewer that understands your background, and delivers
              actionable insights after every session.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            <motion.div variants={cardVariants} className="flex">
              <motion.div
                className="flex-1"
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="group relative flex h-full flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/10">
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardHeader className="flex-none space-y-3">
                    <motion.div
                      className="inline-flex w-fit rounded-xl bg-emerald-500/10 p-3"
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg
                        className="h-6 w-6 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">
                        AI practice interview rooms
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Step into a live, conversational interview that feels
                        like a real hiring panel.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        Coding, system design, and behavioral prompts in one
                        flow
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        Difficulty that adapts to your answers and experience
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        Runs in your browser using camera, mic, and transcripts
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Structured interview history */}
            <motion.div variants={cardVariants} className="flex">
              <motion.div
                className="flex-1"
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="group relative flex h-full flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10">
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardHeader className="flex-none space-y-3">
                    <motion.div
                      className="inline-flex w-fit rounded-xl bg-primary/10 p-3"
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v2m6-2v2M9 9h6m-9 4h12M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                        />
                      </svg>
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">
                        Structured interview history
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Every practice session saved with a clear timeline, so
                        you can see your progress at a glance.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        Chronological view of interviews with timestamps and
                        outcomes.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        Jump back into detailed summaries and transcripts
                        whenever you need.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        Filter by company, role, or interview type to focus your
                        prep.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="flex md:col-span-2 lg:col-span-1"
            >
              <motion.div
                className="flex-1"
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="group relative flex h-full flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-sky-500/60 hover:shadow-xl hover:shadow-sky-500/10">
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardHeader className="flex-none space-y-3">
                    <motion.div
                      className="inline-flex w-fit rounded-xl bg-sky-500/10 p-3"
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg
                        className="h-6 w-6 text-sky-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">
                        Interview insights
                      </CardTitle>
                      <CardDescription className="mt-2">
                        See where you&apos;re strong, where you&apos;re stuck,
                        and what to practice next.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-sky-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        Session summaries with strengths and areas of
                        improvement
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-sky-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>
                        High-level scores for technical depth and communication
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 mt-0.5 flex-shrink-0 text-sky-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>Trend over time so you know when you&apos;re ready</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing - free during beta */}
      <section
        id="pricing"
        ref={pricingRef}
        className="relative border-b border-border/50 bg-gradient-to-b from-background to-primary/5"
      >
        {/* Animated gradient orbs */}
        <motion.div
          className="pointer-events-none absolute left-0 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{
            x: [50, -50, 50],
            y: [30, -30, 30],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:py-20"
          initial="hidden"
          animate={pricingInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div
            className="max-w-3xl space-y-4 text-center mx-auto pb-8"
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/5 text-xs uppercase tracking-wide text-emerald-500"
              >
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Free during beta
                </span>
              </Badge>
            </motion.div>
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              variants={itemVariants}
            >
              Start practicing for
              <motion.span
                className="block bg-gradient-to-r from-emerald-500 via-primary to-sky-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                free today
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Full access to all features during beta. No credit card required,
              no hidden fees.
            </motion.p>
          </motion.div>

          <motion.div
            className="mx-auto max-w-4xl"
            variants={containerVariants}
          >
            <motion.div variants={cardVariants}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card className="group relative overflow-hidden border-border/50 bg-card shadow-2xl">
                  <CardHeader className="space-y-4 pb-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="inline-flex rounded-lg bg-emerald-500/10 p-2"
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                          >
                            <svg
                              className="h-5 w-5 text-emerald-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                          <CardTitle className="text-2xl">
                            Beta Access
                          </CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          Everything you need to ace your next technical
                          interview
                        </CardDescription>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                        Free
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <motion.span
                        className="text-5xl font-bold tracking-tight"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        $0
                      </motion.span>
                      <span className="text-lg text-muted-foreground">
                        / month
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full access during beta. No credit card required.
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-6 pb-8">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">
                        Everything included:
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <motion.div
                          className="flex items-start gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <svg
                            className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium">
                              AI interview rooms
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Unlimited sessions
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          className="flex items-start gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <svg
                            className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium">
                              Detailed insights
                            </p>
                            <p className="text-xs text-muted-foreground">
                              After every session
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          className="flex items-start gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <svg
                            className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium">
                              All interview types
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Coding, system design & behavioral
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Coming soon:
                        </span>{" "}
                        Team plans for hiring managers and interview
                        coordinators
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <motion.div
                      className="w-full sm:w-auto"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="lg"
                        onClick={handleStartClick}
                        disabled={startLoading}
                        className="group relative w-full overflow-hidden shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/40 sm:w-auto"
                      >
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-white/20 to-emerald-500/0"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative flex items-center gap-2">
                          Start practicing free
                          <motion.svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            initial={{ x: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </motion.svg>
                        </span>
                      </Button>
                    </motion.div>
                    <p className="text-xs text-center text-muted-foreground sm:text-left">
                      No credit card · Start in 2 minutes
                    </p>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative border-b border-border/50 bg-background">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20 lg:py-24">
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
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Join engineers practicing with Panelroom. Upload your resume and
              start your first AI interview in minutes.
            </p>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                onClick={handleStartClick}
                disabled={startLoading}
                className="group relative overflow-hidden shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/40"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative flex items-center gap-2">
                  Get started now
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

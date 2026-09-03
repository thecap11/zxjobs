"use client";

import Aurora from "@/components/ui/Aurora";
import BlurText from "@/components/ui/BlurText";
import ShinyText from "@/components/ui/ShinyText";
import SpotlightCard from "@/components/ui/SpotlightCard";
import GradientText from "@/components/ui/GradientText";
import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["800"] });

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FileText, Target, Send, Zap, Shield, BarChart3, Users, Globe, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground relative overflow-hidden">
      <main className="flex-1 flex flex-col items-center w-full relative z-10">

        {/* ═══════════════════════════════════════════════════════════════════
            HERO SECTION — ReactBits Powered
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full relative isolate min-h-screen flex items-center justify-center pt-28 pb-24 overflow-hidden bg-black">
          {/* Animated WebGL Background */}
          <div className="absolute inset-0 z-0">
            <Aurora colorStops={["#0a0a0f", "#0f172a", "#1e1b4b", "#0a0a0f"]} blend={0.5} amplitude={1.0} speed={0.4} />
          </div>

          {/* Premium gradient mesh overlays */}
          <div className="absolute inset-0 z-[1] pointer-events-none">
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-500/[0.07] via-indigo-500/[0.04] to-transparent rounded-full blur-[120px]" />
            <div className="absolute top-[5%] right-[5%] w-[300px] h-[300px] bg-cyan-500/[0.05] rounded-full blur-[100px]" />
            <div className="absolute top-[10%] left-[5%] w-[250px] h-[250px] bg-indigo-500/[0.05] rounded-full blur-[100px]" />
          </div>

          {/* Subtle grid texture */}
          <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.015]" style={{
            backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, #000 50%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, #000 50%, transparent 100%)',
          }} />

          <div className="max-w-[1100px] mx-auto px-6 relative z-10 w-full">

            {/* Announcement pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.08)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <ShinyText text="Matching 50,000+ jobs daily" disabled={false} speed={3} className="text-[13px] font-medium" />
              </div>
            </motion.div>

            {/* Headline */}
            <div className={`text-center mb-8 ${bricolage.className}`}>
              <h1 className="text-[clamp(3rem,6.5vw,6.5rem)] leading-[1.02] tracking-[-0.04em] font-extrabold mx-auto max-w-[920px] flex flex-col items-center justify-center gap-1">
                <span className="text-white/95" style={{ textShadow: '0 0 80px rgba(255,255,255,0.15)' }}>Your career,</span>
                <GradientText
                  colors={["#60A5FA", "#818CF8", "#A5B4FC", "#60A5FA"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="!text-[clamp(3rem,6.5vw,6.5rem)] !leading-[1.02] !font-extrabold !tracking-[-0.04em]"
                >
                  intelligently matched.
                </GradientText>
              </h1>
            </div>

            {/* Subhead with BlurText */}
            <div className="text-center text-[17px] md:text-[19px] leading-[1.6] max-w-[600px] mx-auto mb-12 font-medium text-white/55">
              <BlurText
                text="Upload your resume. Our engine analyzes your skills, matches you to the right roles, and tracks every application."
                delay={30}
                animateBy="words"
                direction="top"
              />
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/register">
                <button className="group h-[54px] px-9 rounded-2xl text-[15px] font-bold tracking-tight transition-all duration-300 hover:scale-[1.03] active:scale-95 inline-flex items-center gap-2.5 bg-white text-black shadow-[0_8px_40px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_50px_rgba(255,255,255,0.25)]">
                  Start for Free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link href="/ats-checker">
                <button className="group h-[54px] px-9 rounded-2xl text-[15px] font-bold tracking-tight transition-all duration-300 hover:scale-[1.03] active:scale-95 inline-flex items-center gap-2.5 bg-white/[0.04] text-white/90 backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12]">
                  <Shield className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors" />
                  Check ATS Score
                </button>
              </Link>
            </motion.div>

            {/* Product Preview wrapped in SpotlightCard */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative max-w-[880px] mx-auto"
            >
              {/* Floating glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/[0.08] via-blue-500/[0.04] to-transparent rounded-[32px] blur-[40px] pointer-events-none" />

              <SpotlightCard className="p-[1.5px] rounded-[22px] border border-white/[0.06]" spotlightColor="rgba(99, 102, 241, 0.15)">
                <div className="relative rounded-[20.5px] overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-2xl">
                {/* Window chrome */}
                <div className="flex items-center px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                  <div className="flex gap-[6px]">
                    <div className="w-[10px] h-[10px] rounded-full bg-white/[0.06]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-white/[0.06]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-white/[0.06]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-5 py-[3px] rounded-[6px] text-[11px] font-mono bg-white/[0.02] border border-white/[0.04] text-white/20">
                      zxjobs.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard mock content */}
                <div className="p-5 md:p-6 space-y-3.5">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: "Matched", value: "147", accent: "#818cf8" },
                      { label: "Match Rate", value: "94%", accent: "#6ee7b7" },
                      { label: "Applied", value: "23", accent: "#93c5fd" },
                    ].map((s, i) => (
                      <div key={i} className="p-3.5 rounded-[12px] bg-white/[0.015] border border-white/[0.04] relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                        <p className="text-[10px] uppercase tracking-[0.12em] mb-1.5 text-white/25 font-medium">{s.label}</p>
                        <p className="text-xl font-bold" style={{ color: s.accent }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Job rows */}
                  <div className="space-y-2">
                    {[
                      { title: "Senior Frontend Engineer", co: "TechCorp · Remote", pct: "96%", delay: "0s" },
                      { title: "Full Stack Developer", co: "ScaleUp Inc. · Hybrid", pct: "91%", delay: "0.1s" },
                      { title: "React Native Developer", co: "AppVerse · Bangalore", pct: "88%", delay: "0.2s" },
                    ].map((j, i) => (
                      <div key={i} className="group flex items-center justify-between p-3.5 rounded-[12px] bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.07] transition-all duration-300 cursor-default">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.05] flex items-center justify-center text-[11px] font-bold text-white/30">
                            {j.co.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-white/80 group-hover:text-white/95 transition-colors">{j.title}</p>
                            <p className="text-[11px] mt-0.5 text-white/25">{j.co}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Match bar */}
                          <div className="hidden sm:flex w-16 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-400/60" style={{ width: j.pct }} />
                          </div>
                          <div className="px-2.5 py-1 rounded-[8px] text-[11px] font-bold bg-emerald-400/[0.08] text-emerald-300 border border-emerald-400/[0.12]">
                            {j.pct}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black pointer-events-none z-[2]" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            LOGO CLOUD — Social Proof
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-16 border-y border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-center text-[11px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em] mb-10">Trusted by professionals from leading companies</p>
            <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-6 opacity-[0.3]">
              <span className="text-xl font-bold tracking-[-0.04em]">Google</span>
              <span className="text-xl font-bold tracking-[0.15em] uppercase text-sm">Microsoft</span>
              <span className="text-xl font-bold tracking-[-0.02em]">Amazon</span>
              <span className="text-xl font-bold tracking-[-0.03em] italic">Infosys</span>
              <span className="text-xl font-bold tracking-[0.1em] uppercase text-sm">TCS</span>
              <span className="text-xl font-bold tracking-[-0.04em]">Wipro</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FEATURES — Enterprise-grade cards
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[13px] font-semibold text-primary uppercase tracking-[0.15em] mb-4"
              >
                Platform
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold tracking-tight mb-5"
              >
                Everything you need to land your next role
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg text-muted-foreground/70 max-w-2xl mx-auto"
              >
                A complete job search toolkit — from resume parsing to application tracking. No more juggling ten different tabs.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
              {[
                {
                  icon: <FileText className="w-5 h-5" />,
                  title: "AI Resume Parser",
                  desc: "Drop your PDF. Our engine extracts skills, experience, education, and suggests optimal job roles in seconds.",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10"
                },
                {
                  icon: <Target className="w-5 h-5" />,
                  title: "Smart Job Matching",
                  desc: "We score thousands of listings daily against your profile and surface only the roles where you're a strong fit.",
                  color: "text-purple-400",
                  bg: "bg-purple-400/10"
                },
                {
                  icon: <BarChart3 className="w-5 h-5" />,
                  title: "ATS Compatibility Check",
                  desc: "Get a detailed, deterministic score across 8 categories to ensure your resume passes automated screening.",
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10"
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 bg-background/80 hover:bg-white/[0.03] transition-colors"
                >
                  <div className={`w-11 h-11 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            HOW IT WORKS — Clean numbered steps
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.15em] mb-4">How it works</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">Three steps to your next offer</h2>
              <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto">
                From upload to interview. No noise, no friction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {[
                {
                  step: "01",
                  title: "Upload your resume",
                  desc: "Drop your PDF. Our AI extracts your skills, experience, and ideal role in under 10 seconds.",
                  icon: <FileText className="w-5 h-5" />
                },
                {
                  step: "02",
                  title: "Review your matches",
                  desc: "We scan 50,000+ listings daily and rank them by fit. You only see roles where you score 80%+.",
                  icon: <Target className="w-5 h-5" />
                },
                {
                  step: "03",
                  title: "Apply & track",
                  desc: "Apply directly on company sites. Track status, take notes, and manage your pipeline in one dashboard.",
                  icon: <Send className="w-5 h-5" />
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="text-[80px] font-black text-white/[0.03] leading-none absolute -top-6 -left-2 select-none pointer-events-none">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-primary mb-5">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground/70 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            STATS — Metric bar
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full border-y border-white/[0.04] bg-white/[0.01] py-20">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Jobs Matched", icon: <Globe className="w-4 h-4" /> },
              { value: "10K+", label: "Active Users", icon: <Users className="w-4 h-4" /> },
              { value: "85%", label: "Interview Rate", icon: <BarChart3 className="w-4 h-4" /> },
              { value: "<30s", label: "Setup Time", icon: <Clock className="w-4 h-4" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3"
              >
                <p className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground/60 font-medium uppercase tracking-wider flex items-center justify-center gap-1.5">
                  {stat.icon}
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Ready to find your <br className="hidden sm:block" />next role?
              </h2>
              <p className="text-lg text-muted-foreground/70 mb-10 max-w-xl mx-auto">
                Join thousands of professionals who have accelerated their careers with zxjobs. Free forever.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-base font-semibold rounded-xl bg-primary text-primary-foreground shadow-[0_1px_40px_rgba(var(--primary),0.25)] hover:shadow-[0_1px_60px_rgba(var(--primary),0.4)] transition-all duration-300 hover:brightness-110 gap-2">
                    Get Started for Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-xs text-muted-foreground/40">No credit card · No spam · Cancel anytime</p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════════════ */}
        <footer className="w-full border-t border-white/[0.06] bg-black/30 backdrop-blur-sm pt-16 pb-8 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                  Z
                </div>
                <span className="font-extrabold text-lg tracking-tight">zxjobs</span>
              </Link>
              <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-[220px]">
                AI-powered job matching for ambitious professionals.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-5 text-foreground/80">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/50">
                <li><Link href="/ats-checker" className="hover:text-foreground transition-colors">ATS Checker</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Job Matches</Link></li>
                <li><Link href="/applications" className="hover:text-foreground transition-colors">Application Tracker</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-5 text-foreground/80">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/50">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-5 text-foreground/80">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground/50">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="max-w-6xl mx-auto pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[13px] text-muted-foreground/40">
              © {new Date().getFullYear()} zxjobs. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-[13px] text-muted-foreground/40 hover:text-foreground transition-colors">Twitter</Link>
              <Link href="#" className="text-[13px] text-muted-foreground/40 hover:text-foreground transition-colors">GitHub</Link>
              <Link href="#" className="text-[13px] text-muted-foreground/40 hover:text-foreground transition-colors">LinkedIn</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

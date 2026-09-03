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
import Aurora from "@/components/ui/Aurora";
import BlurText from "@/components/ui/BlurText";
import ShinyText from "@/components/ui/ShinyText";
import SpotlightCard from "@/components/ui/SpotlightCard";

        {/* ═══════════════════════════════════════════════════════════════════
            HERO SECTION — ReactBits Powered
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full relative isolate min-h-screen flex items-center justify-center pt-32 pb-32 overflow-hidden bg-black">
          {/* Animated WebGL Background */}
          <div className="absolute inset-0 z-0">
            <Aurora colorStops={["#000000", "#111827", "#1e1b4b", "#0f172a"]} blend={0.6} amplitude={1.2} speed={0.5} />
          </div>

          <div className="max-w-[1100px] mx-auto px-6 relative z-10 w-full">

            {/* Announcement pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-10"
            >
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <ShinyText text="Matching 50,000+ jobs daily" disabled={false} speed={3} className="text-[13px] font-medium" />
              </div>
            </motion.div>

            {/* Headline */}
            <div className={`text-center mb-10 ${bricolage.className}`}>
              <h1 className="text-[clamp(3.5rem,7vw,7rem)] leading-[1] tracking-[-0.03em] font-extrabold mx-auto max-w-[950px] flex flex-col items-center justify-center gap-2">
                <span className="text-white drop-shadow-2xl">Your career,</span>
                <GradientText
                  colors={["#60A5FA", "#818CF8", "#C084FC", "#60A5FA"]}
                  animationSpeed={6}
                  showBorder={false}
                  className="!text-[clamp(3.5rem,7vw,7rem)] !leading-[1] !font-extrabold !tracking-[-0.03em] drop-shadow-xl"
                >
                  intelligently matched.
                </GradientText>
              </h1>
            </div>

            {/* Subhead with BlurText */}
            <div className="text-center text-[18px] md:text-[20px] leading-[1.7] max-w-[650px] mx-auto mb-14 font-medium text-white/60">
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
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            >
              <Link href="/register">
                <button className="h-[56px] px-10 rounded-2xl text-[16px] font-bold tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-3 bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                  Start for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/ats-checker">
                <button className="h-[56px] px-10 rounded-2xl text-[16px] font-bold tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-3 bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20">
                  Check ATS Score
                </button>
              </Link>
            </motion.div>

            {/* Product Preview wrapped in SpotlightCard */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative max-w-[900px] mx-auto"
            >
              <SpotlightCard className="p-1 rounded-[24px]" spotlightColor="rgba(99, 102, 241, 0.2)">
                <div className="relative rounded-[20px] overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10">
                {/* Window chrome */}
                <div className="flex items-center px-5 py-3" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex gap-[6px]">
                    <div className="w-[10px] h-[10px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="w-[10px] h-[10px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="w-[10px] h-[10px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-6 py-[3px] rounded-[6px] text-[11px] font-mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.22)' }}>
                      zxjobs.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard mock content */}
                <div className="p-5 md:p-7 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Matched", value: "147", accent: "#818cf8" },
                      { label: "Match Rate", value: "94%", accent: "#6ee7b7" },
                      { label: "Applied", value: "23", accent: "#93c5fd" },
                    ].map((s, i) => (
                      <div key={i} className="p-3.5 rounded-[12px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <p className="text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.label}</p>
                        <p className="text-xl font-bold" style={{ color: s.accent }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { title: "Senior Frontend Engineer", co: "TechCorp · Remote", pct: "96%" },
                      { title: "Full Stack Developer", co: "ScaleUp Inc. · Hybrid", pct: "91%" },
                      { title: "React Native Developer", co: "AppVerse · Bangalore", pct: "88%" },
                    ].map((j, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 rounded-[12px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{j.title}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{j.co}</p>
                        </div>
                        <div className="px-2.5 py-1 rounded-[8px] text-[11px] font-bold" style={{ background: 'rgba(110,231,183,0.08)', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.12)' }}>
                          {j.pct}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Bottom separator */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
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

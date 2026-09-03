"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Info, ArrowRight, UploadCloud, FileText, ShieldCheck, Loader2 } from "lucide-react";
import { ATSResult } from "@/lib/ats/engine";
import { motion } from "framer-motion";

const CircularProgress = ({ value, colorClass }: { value: number, colorClass: string }) => {
  const radius = 64;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const strokeColor = colorClass.includes("green") ? "stroke-green-500" :
                      colorClass.includes("emerald") ? "stroke-emerald-400" :
                      colorClass.includes("orange") ? "stroke-orange-400" : "stroke-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          className="stroke-white/5"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          className={`${strokeColor}`}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.1))' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-5xl font-black ${colorClass}`}>{value}</span>
      </div>
    </div>
  );
};

export default function AtsCheckerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/ats-checker");
    } else if (status === "authenticated") {
      // Check if user has an existing resume
      fetch("/api/profile")
        .then(res => res.json())
        .then(data => {
          if (data && data.resumeFilePath) { // or similar indicator
            // Usually we can just check if they have a profile, but letting the backend handle missing resumes is fine.
            setHasExistingResume(true);
          }
        })
        .catch(() => {});
    }
  }, [status, router]);

  const handleAnalyze = async (useExisting: boolean) => {
    if (!useExisting && !file) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (useExisting) {
      formData.append("useExisting", "true");
    } else if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/ats", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to analyze resume.");
      }
    } catch (e) {
      setError("An unexpected error occurred while analyzing the resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading your environment...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-emerald-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-500";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Needs improvement";
    return "Needs work";
  };

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none -z-10"></div>
      
      <div className="container max-w-5xl mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-6 bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
            ATS Compatibility Engine
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Run your resume against our proprietary parsing engine. Get deterministic insights, 
            fix formatting errors, and increase your callback rate.
          </p>
        </motion.div>

        {!result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-8 pt-10 px-10">
                <CardTitle className="text-2xl font-bold">Initialize Analysis</CardTitle>
                <CardDescription className="text-base mt-2">
                  Verify structure, formatting, and keyword optimization against standard ATS algorithms.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <div className="space-y-8">
                  {hasExistingResume && (
                    <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-5 transition-all hover:bg-primary/10 hover:border-primary/30">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Current Profile Resume</p>
                          <p className="text-sm text-muted-foreground mt-0.5">Run analysis on your saved document.</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleAnalyze(true)} 
                        disabled={isAnalyzing}
                        className="w-full sm:w-auto h-11 px-6 rounded-lg font-semibold shadow-lg shadow-primary/20"
                      >
                        {isAnalyzing ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                        ) : "Analyze Saved"}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-white/80">Upload New Resume (PDF)</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <UploadCloud className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
                        </div>
                        <Input 
                          type="file" 
                          accept="application/pdf"
                          className="pl-12 bg-white/5 border-white/10 cursor-pointer h-14 rounded-xl file:hidden hover:bg-white/10 transition-colors text-sm py-4"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <Button 
                        variant="secondary" 
                        className="h-14 w-full sm:w-auto px-8 rounded-xl font-semibold bg-white text-black hover:bg-white/90"
                        disabled={!file || isAnalyzing}
                        onClick={() => handleAnalyze(false)}
                      >
                        {isAnalyzing ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                        ) : "Analyze File"}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3"
                    >
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-white/[0.01] border-t border-white/5 px-10 py-6">
                <p className="text-xs text-muted-foreground flex gap-3 leading-relaxed">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    The ATS Compatibility Score is a deterministic estimate based on common parsing practices. Different employers use varying algorithms, so this score is an optimization tool, not a guarantee.
                  </span>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, staggerChildren: 0.1 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white/[0.02] border border-white/10 p-6 rounded-2xl backdrop-blur-md">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Analysis Complete</h2>
                <p className="text-muted-foreground mt-1">Report generated successfully.</p>
              </div>
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-lg h-11 px-6" onClick={() => setResult(null)}>
                Analyze Another
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* SCORE CARD */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl rounded-3xl flex flex-col justify-center text-center p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-48 h-48" />
                  </div>
                  <CardHeader className="p-0 mb-8 relative z-10">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      Overall Compatibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-grow flex flex-col items-center justify-center relative z-10">
                    <CircularProgress value={result.overallScore} colorClass={getScoreColor(result.overallScore)} />
                    <div className="text-2xl font-bold mt-8 mb-6 tracking-tight text-white">
                      {getScoreLabel(result.overallScore)}
                    </div>
                    
                    {result.issues.length > 0 && (
                      <div className="w-full text-left bg-black/40 rounded-xl p-5 border border-white/5 mt-auto">
                        <p className="text-sm font-bold mb-3 text-white/80 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          Critical Issues
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          {result.issues.slice(0, 3).map((issue, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-orange-400/50 mt-0.5">•</span>
                              <span className="leading-tight">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* BREAKDOWN */}
              <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="h-full border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl rounded-3xl">
                  <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5">
                    <CardTitle className="text-2xl font-bold">Metrics Breakdown</CardTitle>
                    <CardDescription className="text-base mt-1">Detailed performance across standard parsing criteria.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid gap-6">
                      {[
                        { name: "Contact Information", score: result.categoryScores.contactInfo, max: 10 },
                        { name: "Resume Structure", score: result.categoryScores.structure, max: 15 },
                        { name: "Section Headings", score: result.categoryScores.sectionHeadings, max: 15 },
                        { name: "Skills Section", score: result.categoryScores.skills, max: 15 },
                        { name: "Experience Structure", score: result.categoryScores.experience, max: 15 },
                        { name: "Keyword Quality", score: result.categoryScores.keywordQuality, max: 15 },
                        { name: "Formatting / Safety", score: result.categoryScores.formatting, max: 10 },
                        { name: "File & Text Quality", score: result.categoryScores.textQuality, max: 5 },
                      ].map((cat, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <span className="text-sm font-bold text-white/90 sm:w-1/3">{cat.name}</span>
                          <div className="flex items-center gap-5 sm:w-2/3">
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(cat.score / cat.max) * 100}%` }}
                                transition={{ duration: 1, delay: 0.4 + (i * 0.1), ease: "easeOut" }}
                                className={`h-full rounded-full ${getScoreColor((cat.score/cat.max) * 100).replace('text-', 'bg-')} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} 
                              />
                            </div>
                            <span className="text-sm font-mono font-medium text-muted-foreground w-12 text-right">
                              {cat.score}/{cat.max}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* STRENGTHS */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="h-full border-green-500/20 bg-green-500/[0.03] backdrop-blur-xl rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-green-500 flex items-center gap-3 text-xl font-bold">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      Optimized Vectors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <ul className="space-y-4">
                      {result.strengths.length === 0 ? (
                        <li className="text-sm text-muted-foreground">No major strengths detected.</li>
                      ) : (
                        result.strengths.map((str, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                              <span className="text-green-500 text-xs font-bold">✓</span>
                            </div>
                            <span className="text-sm leading-relaxed text-white/80">{str}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* RECOMMENDATIONS */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="h-full border-orange-500/20 bg-orange-500/[0.03] backdrop-blur-xl rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-orange-400 flex items-center gap-3 text-xl font-bold">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      Required Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <ul className="space-y-6">
                      {result.recommendations.length === 0 ? (
                        <li className="text-sm text-muted-foreground">Resume parsed perfectly. No required actions.</li>
                      ) : (
                        result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                              <ArrowRight className="h-3 w-3 text-orange-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-orange-200/90 mb-1.5 text-sm">{result.issues[i]}</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
              <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 text-center mt-12 p-1 rounded-3xl overflow-hidden">
                <CardContent className="p-12 backdrop-blur-xl rounded-[22px] bg-black/40 border border-white/5 space-y-6">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/20 mb-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">Deploy Your Resume</h3>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Leverage your verified ATS score to match with high-intent technical roles.
                  </p>
                  <div className="pt-4">
                    <Link href="/dashboard">
                      <Button size="lg" className="h-14 px-10 text-base font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                        Explore Opportunities <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

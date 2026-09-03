"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MatchResult } from "@/lib/matching/engine";
import { motion } from "framer-motion";
import { Building2, MapPin, Briefcase, Banknote, Clock, Sparkles, RefreshCw, Search, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchJobs();
    }
  }, [status, router]);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/search?profile=true");
      if (res.status === 404) {
        router.push("/profile");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      } else {
        setError("Failed to fetch jobs.");
      }
    } catch (e) {
      setError("An error occurred while fetching jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobData: MatchResult["job"]) => {
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: jobData.source,
          sourceJobId: jobData.sourceJobId,
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          applicationUrl: jobData.applicationUrl,
        }),
      });
      if (res.ok) {
        alert("Job saved successfully!");
      } else {
        alert("Job might already be saved or an error occurred.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving job.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
        <Search className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold text-foreground">Scanning the web for your best matches</p>
        <p className="text-sm text-muted-foreground">This usually takes 15–30 seconds...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-destructive text-2xl">!</span>
      </div>
      <p className="text-lg text-destructive font-medium">{error}</p>
      <Button onClick={fetchJobs} variant="outline">Try Again</Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-8 py-10 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Your Job Matches
            </h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 ml-[52px]">
            <Sparkles className="w-4 h-4 text-primary" />
            We found <strong className="text-foreground">{matches.length}</strong> jobs matching your profile
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Button onClick={fetchJobs} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-foreground gap-2 rounded-full px-6 h-11 transition-all">
            <RefreshCw className="w-4 h-4" />
            Refresh Jobs
          </Button>
        </motion.div>
      </div>

      {/* Stats Strip */}
      {matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Matches", value: matches.length, icon: <Search className="w-4 h-4" /> },
            { label: "High Match (90%+)", value: matches.filter(m => m.overallScore >= 90).length, icon: <TrendingUp className="w-4 h-4" /> },
            { label: "Companies", value: new Set(matches.map(m => m.job.company)).size, icon: <Building2 className="w-4 h-4" /> },
            { label: "Remote Available", value: matches.filter(m => m.job.remoteType).length, icon: <MapPin className="w-4 h-4" /> },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">
                {stat.icon}
                {stat.label}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {matches.length === 0 ? (
        <Card className="text-center py-16 bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">No strong matches right now</CardTitle>
            <CardDescription className="text-base mt-2">Try expanding your preferred locations or roles in your profile to get more results.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button size="lg" className="rounded-full px-8 h-12">Update Profile</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {matches.map((match, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card className="flex flex-col h-full overflow-hidden bg-white/[0.03] border-white/10 shadow-xl shadow-black/20 backdrop-blur-md group hover:border-primary/40 transition-all duration-300 relative rounded-2xl">
                
                {/* Match Score Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary" className={`px-3 py-1 font-bold tracking-wide border ${
                    match.overallScore >= 90 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                      : match.overallScore >= 80 
                        ? 'bg-primary/15 text-primary border-primary/25' 
                        : 'bg-orange-500/15 text-orange-400 border-orange-500/25'
                  }`}>
                    {match.overallScore}% Match
                  </Badge>
                </div>

                <div className="flex-grow p-6 flex flex-col pt-12">
                  <div className="mb-4">
                    <Badge variant="outline" className="mb-3 bg-white/5 text-foreground/50 border-white/10 uppercase tracking-widest text-[10px] font-medium">
                      {match.job.source}
                    </Badge>
                    <h2 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem] mb-3">
                      <a href={match.job.applicationUrl} target="_blank" rel="noopener noreferrer">
                        {match.job.title}
                      </a>
                    </h2>
                    
                    <div className="text-muted-foreground font-medium space-y-1.5">
                      <p className="flex items-center gap-2 text-foreground/80 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                        {match.job.company}
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                        {match.job.location || "Remote"}
                        {match.job.remoteType && <span className="text-emerald-400 font-semibold text-xs ml-1">({match.job.remoteType})</span>}
                      </p>
                    </div>
                  </div>
                  
                  {/* Job Tags */}
                  <div className="flex flex-wrap gap-2 mb-5 text-xs text-muted-foreground font-medium">
                    {match.job.experienceMin !== undefined && (
                      <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {match.job.experienceMin}-{match.job.experienceMax || "+"} yrs
                      </span>
                    )}
                    {match.job.salaryMin && (
                      <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5" />
                        ₹{match.job.salaryMin.toLocaleString()} - ₹{match.job.salaryMax?.toLocaleString() ?? "+"}
                      </span>
                    )}
                    {match.job.employmentType && (
                      <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {match.job.employmentType}
                      </span>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="mt-auto flex flex-col gap-2.5 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    {match.matchingSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider w-16 shrink-0">Matches</span>
                        {match.matchingSkills.slice(0, 5).map(s => (
                          <Badge key={s} variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{s}</Badge>
                        ))}
                        {match.matchingSkills.length > 5 && <span className="text-xs text-muted-foreground/60 ml-1">+{match.matchingSkills.length - 5}</span>}
                      </div>
                    )}
                    {match.missingSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-wider w-16 shrink-0">Missing</span>
                        {match.missingSkills.slice(0, 3).map(s => (
                          <Badge key={s} variant="outline" className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/20">{s}</Badge>
                        ))}
                        {match.missingSkills.length > 3 && <span className="text-xs text-muted-foreground/60 ml-1">+{match.missingSkills.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="bg-white/[0.03] p-4 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    Posted {match.job.postedAt ? new Date(match.job.postedAt).toLocaleDateString() : 'Recently'}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/10 transition-colors rounded-xl h-10" onClick={() => handleSaveJob(match.job)}>
                      Save
                    </Button>
                    <Button className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 rounded-xl h-10 font-semibold" onClick={() => window.open(match.job.applicationUrl, '_blank')}>
                      Apply Now
                    </Button>
                  </div>
                </div>

              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

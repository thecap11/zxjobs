"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Loader2, Briefcase, ExternalLink, Calendar, LayoutDashboard } from "lucide-react";

export default function ApplicationsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchApplications();
    }
  }, [status, router]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        setApplications(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchApplications();
    } catch (e) {
      console.error(e);
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Saved": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Applied": return "bg-primary/10 text-primary border-primary/20";
      case "Interview": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Offer": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Rejected": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-muted-foreground font-medium"
        >
          Loading your applications...
        </motion.p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl py-12 space-y-10">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl shadow-sm">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Application Tracker
            </span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl ml-12">
          Monitor your job applications, update statuses, and keep notes on your journey to your next role.
        </p>
      </motion.div>
      
      {applications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center py-20 border-dashed bg-gradient-to-b from-background to-muted/20">
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="p-6 bg-primary/5 rounded-full ring-1 ring-primary/10">
                <LayoutDashboard className="h-12 w-12 text-primary/40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">No applications tracked yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Your pipeline is currently empty. Start tracking your applications to see them appear here.
                </p>
              </div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm"
              >
                Go to Dashboard
              </button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5"
        >
          {applications.map((app) => (
            <motion.div key={app.id} variants={itemVariants}>
              <Card className="overflow-hidden bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-grow space-y-3">
                      <div className="flex items-start justify-between md:justify-start gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold flex items-center gap-2 group">
                            <a 
                              href={app.applicationUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group-hover:text-primary transition-colors flex items-center gap-2"
                            >
                              {app.title}
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                          </h3>
                          <p className="text-lg text-muted-foreground font-medium">{app.company}</p>
                        </div>
                        <Badge variant="outline" className={`ml-auto md:ml-4 rounded-full px-3 py-1 ${getStatusColor(app.status)} font-semibold`}>
                          {app.status}
                        </Badge>
                      </div>
                      
                      {app.appliedAt && (
                        <div className="flex items-center text-sm text-muted-foreground gap-1.5 pt-2">
                          <Calendar className="h-4 w-4" />
                          <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3 min-w-[240px]">
                      <Select 
                        value={app.status} 
                        onValueChange={(val) => updateStatus(app.id, val)}
                      >
                        <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm focus:ring-primary/20">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="font-medium">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Textarea 
                        placeholder="Notes (auto-saves on blur)" 
                        defaultValue={app.notes || ""}
                        onBlur={(e) => updateNotes(app.id, e.target.value)}
                        className="h-24 resize-none text-sm bg-background/50 backdrop-blur-sm focus-visible:ring-primary/20"
                      />
                    </div>
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

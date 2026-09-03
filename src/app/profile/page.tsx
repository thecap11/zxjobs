"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { User, Upload, FileText, MapPin, GraduationCap, Wrench, Briefcase, Save, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [roles, setRoles] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfile(data);
          setLocation(data.location || "");
          setExperience(data.experienceYears?.toString() || "");
          setEducation(data.education || "");
          setSkills(data.skills?.map((s: any) => s.name).join(", ") || "");
          setRoles(data.jobPreference?.roles?.join(", ") || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchProfile();
        setFile(null);
        alert("Resume uploaded and parsed successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Upload failed");
      }
    } catch (e) {
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          experienceYears: experience,
          education,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean),
          roles: roles.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        alert("Profile saved successfully");
        fetchProfile();
      } else {
        alert("Failed to save profile");
      }
    } catch (e) {
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-muted-foreground">Loading your profile...</p>
    </div>
  );

  const hasResume = !!profile?.user?.resume;

  return (
    <div className="container mx-auto px-4 max-w-4xl space-y-8 py-10">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {hasResume ? "Your Profile" : "Welcome! Let's get started"}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg ml-[52px]">
          {hasResume ? "Manage your profile details and resume." : "Upload your resume to automatically extract your skills and find the perfect jobs."}
        </p>
      </motion.div>

      {!hasResume && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-primary">Upload Resume</CardTitle>
                  <CardDescription className="text-sm mt-0.5">
                    Upload a PDF resume. Our AI will extract your skills, experience, and education automatically.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="max-w-md h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer bg-white/5 rounded-xl"
                />
                <Button type="submit" size="lg" disabled={!file || uploading} className="w-full sm:w-auto h-12 shadow-lg shadow-primary/20 rounded-xl font-semibold">
                  {uploading ? "Processing..." : "Upload & Parse Resume"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {hasResume && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="md:col-span-2">
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Edit Information</CardTitle>
                    <CardDescription className="text-sm">Update your details to get better job matches.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleSaveProfile}>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> Location
                      </Label>
                      <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Bangalore" className="bg-white/5 border-white/10 h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" /> Years of Experience
                      </Label>
                      <Input id="experience" type="number" step="0.1" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g., 2.5" className="bg-white/5 border-white/10 h-11 rounded-xl" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="education" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3 h-3" /> Education
                    </Label>
                    <Input id="education" value={education} onChange={e => setEducation(e.target.value)} placeholder="e.g., B.Tech in Computer Science" className="bg-white/5 border-white/10 h-11 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3 h-3" /> Skills (comma separated)
                    </Label>
                    <Textarea 
                      id="skills" 
                      value={skills} 
                      onChange={e => setSkills(e.target.value)} 
                      placeholder="React, Node.js, PostgreSQL"
                      rows={3}
                      className="bg-white/5 border-white/10 resize-none rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roles" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" /> Preferred Roles (comma separated)
                    </Label>
                    <Input 
                      id="roles" 
                      value={roles} 
                      onChange={e => setRoles(e.target.value)} 
                      placeholder="Frontend Developer, Full Stack Engineer"
                      className="bg-white/5 border-white/10 h-11 rounded-xl"
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-white/[0.02] py-4 border-t border-white/10 mt-2">
                  <Button type="submit" size="lg" disabled={saving} className="shadow-lg shadow-primary/20 rounded-xl gap-2 font-semibold">
                    <Save className="w-4 h-4" />
                    {saving ? "Saving Changes..." : "Save Information"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Update Resume</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  Current: <span className="font-semibold text-primary truncate block mt-1 text-sm">{profile.user.resume.fileName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="flex flex-col gap-3">
                  <Input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer bg-white/5 h-auto py-2 rounded-xl"
                  />
                  <Button type="submit" variant="secondary" className="w-full rounded-xl" disabled={!file || uploading}>
                    {uploading ? "Updating..." : "Upload New Resume"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {!hasResume && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md opacity-75 grayscale focus-within:grayscale-0 focus-within:opacity-100 transition-all rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle>Or Add Info Manually</CardTitle>
              <CardDescription>You can manually fill in your details if you don't have a resume right now.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Bangalore" className="bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" type="number" step="0.1" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g., 2.5" className="bg-white/5 border-white/10 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Textarea 
                    id="skills" 
                    value={skills} 
                    onChange={e => setSkills(e.target.value)} 
                    placeholder="React, Node.js, PostgreSQL"
                    rows={2}
                    className="bg-white/5 border-white/10 rounded-xl"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="outline" disabled={saving} className="rounded-xl">
                  {saving ? "Saving..." : "Save Manual Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

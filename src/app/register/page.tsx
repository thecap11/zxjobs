"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { UserPlus, Shield, Zap, BarChart3 } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Something went wrong");
        return;
      }

      // Auto login after register
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/profile"); // send to profile to upload resume
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="relative z-10 w-full max-w-[920px] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
        >
          {/* Left Panel — Brand / Trust */}
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-r border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.15),transparent_60%)]" />
            <div className="relative z-10">
              <Link href="/" className="flex items-center gap-2 mb-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white font-bold shadow-lg shadow-primary/30">
                  Z
                </div>
                <span className="font-extrabold text-xl tracking-tight">zxjobs</span>
              </Link>
              <h2 className="text-2xl font-bold tracking-tight mb-3">Start your job search</h2>
              <p className="text-muted-foreground leading-relaxed">
                Join thousands of job seekers who found their dream role through zxjobs. Upload your resume and let AI do the heavy lifting.
              </p>
            </div>
            <div className="relative z-10 space-y-4 mt-8">
              {[
                { icon: <Zap className="w-4 h-4 text-primary" />, text: "Matched to jobs in seconds" },
                { icon: <BarChart3 className="w-4 h-4 text-primary" />, text: "Free ATS resume checker" },
                { icon: <Shield className="w-4 h-4 text-primary" />, text: "100% free, no credit card" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel — Form */}
          <div className="bg-black/40 backdrop-blur-xl p-8 md:p-10">
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-center md:text-left">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                Join zxjobs to find your next opportunity
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl text-center"
                >
                  {error}
                </motion.div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/80 text-sm ml-1">Full Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-12 px-4 rounded-xl transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80 text-sm ml-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-12 px-4 rounded-xl transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80 text-sm ml-1">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-12 px-4 rounded-xl transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.01] gap-2"
                disabled={loading}
              >
                <UserPlus className="w-4 h-4" />
                {loading ? "Creating account..." : "Sign up"}
              </Button>
              
              <div className="text-sm text-center text-muted-foreground pt-2">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors">
                  Log in
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

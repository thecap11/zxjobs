"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white font-bold shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
            Z
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            zxjobs
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          {status === "loading" ? (
            <div className="h-8 w-20 bg-white/5 animate-pulse rounded-md" />
          ) : session ? (
            <>
              <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 mr-2">
                <Link href="/dashboard" className="text-sm font-medium px-4 py-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/applications" className="text-sm font-medium px-4 py-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  Applications
                </Link>
                <Link href="/ats-checker" className="text-sm font-medium px-4 py-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  ATS Checker
                </Link>
                <Link href="/profile" className="text-sm font-medium px-4 py-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </div>
              
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground" onClick={() => signOut({ callbackUrl: "/" })}>
                Log out
              </Button>
              
              {/* Mobile Logout (Simplified for space) */}
              <Button variant="outline" size="sm" className="sm:hidden border-white/10 bg-transparent text-xs px-3" onClick={() => signOut({ callbackUrl: "/" })}>
                Out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-lg shadow-primary/20 rounded-full px-5">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

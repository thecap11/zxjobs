import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobAggregator } from "@/lib/job-sources/aggregator";
import { calculateMatch, rankJobs } from "@/lib/matching/engine";
import { JobSearchCriteria } from "@/lib/job-sources/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const useProfileParams = searchParams.get("profile") === "true";

    let criteria: JobSearchCriteria = {};
    let candidateData = {
      skills: [] as string[],
      experienceYears: null as number | null,
      location: null as string | null,
      preferredRoles: [] as string[],
      education: null as string | null,
    };

    if (useProfileParams) {
      const profile = await db.candidateProfile.findUnique({
        where: { userId: session.user.id },
        include: { skills: true, jobPreference: true }
      });

      if (!profile) {
        return NextResponse.json({ message: "Profile not found" }, { status: 404 });
      }

      candidateData = {
        skills: profile.skills.map(s => s.name),
        experienceYears: profile.experienceYears,
        location: profile.location,
        preferredRoles: profile.jobPreference?.roles || profile.suggestedRoles || [],
        education: profile.education,
      };

      criteria = {
        location: profile.location || undefined,
        skills: candidateData.skills,
        experience: profile.experienceYears ?? 0,
        jobTitles: candidateData.preferredRoles,
      };
    } else {
      // allow manual overrides
      const qLocation = searchParams.get("location");
      const qRole = searchParams.get("role");
      if (qLocation) criteria.location = qLocation;
      if (qRole) {
        criteria.jobTitles = [qRole];
        candidateData.preferredRoles = [qRole]; // temporarily assume this role for scoring
      }
    }

    // 1. Fetch raw jobs
    const rawJobs = await JobAggregator.search(criteria);

    // 2. Score and rank them against candidate profile
    const rankedMatches = rankJobs(candidateData, rawJobs);

    // Return top 150 matches for performance (increased from 50)
    return NextResponse.json(rankedMatches.slice(0, 150));
  } catch (error: any) {
    console.error("Job Search API Error:", error);
    return NextResponse.json({ message: error?.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

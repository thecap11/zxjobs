import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: true,
      jobPreference: true,
      user: {
        include: {
          resume: true,
        }
      }
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { experienceYears, location, education, skills, roles } = body;

  const profile = await db.candidateProfile.upsert({
    where: { userId: session.user.id },
    update: {
      experienceYears: parseFloat(experienceYears) || null,
      location,
      education,
    },
    create: {
      userId: session.user.id,
      experienceYears: parseFloat(experienceYears) || null,
      location,
      education,
    }
  });

  // Update skills
  if (skills && Array.isArray(skills)) {
    await db.candidateSkill.deleteMany({
      where: { candidateProfileId: profile.id },
    });
    await db.candidateSkill.createMany({
      data: skills.map((skill) => ({
        candidateProfileId: profile.id,
        name: skill.trim(),
      })),
    });
  }

  // Update Preferences
  if (roles && Array.isArray(roles)) {
    await db.jobPreference.upsert({
      where: { candidateProfileId: profile.id },
      update: {
        roles: roles,
      },
      create: {
        candidateProfileId: profile.id,
        roles: roles,
      }
    });
  }

  return NextResponse.json({ message: "Profile updated" });
}

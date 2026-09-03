import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePdfBuffer } from "@/lib/resume/parser";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ message: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ message: "File size must be less than 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse resume
    const parsedData = await parsePdfBuffer(buffer);
    
    if (!parsedData.rawText || parsedData.rawText.trim().length === 0) {
      return NextResponse.json(
        { message: "Could not read text from this PDF. Please ensure it's not a scanned image or corrupted file, and try again." }, 
        { status: 400 }
      );
    }

    // Save file locally if writable (fallback to os.tmpdir() on Vercel)
    const fileName = `${session.user.id}-${Date.now()}.pdf`;
    let filePath = fileName;
    try {
      const isServerless = process.env.NODE_ENV === "production" || process.env.VERCEL;
      const baseDir = isServerless ? path.join(os.tmpdir(), "resumes") : path.join(process.cwd(), ".storage", "resumes");
      await fs.mkdir(baseDir, { recursive: true });
      filePath = path.join(baseDir, fileName);
      await fs.writeFile(filePath, buffer);
    } catch (fsErr) {
      console.warn("[Upload] Local disk write skipped (serverless environment):", fsErr);
    }

    // Save to DB in a transaction
    await db.$transaction(async (tx) => {
      // Upsert Resume
      const resume = await tx.resume.upsert({
        where: { userId: session.user.id },
        update: {
          fileName: file.name,
          filePath: filePath,
          rawText: parsedData.rawText,
        },
        create: {
          userId: session.user.id,
          fileName: file.name,
          filePath: filePath,
          rawText: parsedData.rawText,
        },
      });

      // Upsert Candidate Profile
      const profile = await tx.candidateProfile.upsert({
        where: { userId: session.user.id },
        update: {
          experienceYears: parsedData.experienceYears,
          education: parsedData.education,
          location: parsedData.location,
          suggestedRoles: parsedData.suggestedRoles,
        },
        create: {
          userId: session.user.id,
          experienceYears: parsedData.experienceYears,
          education: parsedData.education,
          location: parsedData.location,
          suggestedRoles: parsedData.suggestedRoles,
        },
      });

      if (parsedData.rawText && parsedData.rawText.trim().length > 0) {
        // Only update skills if we successfully parsed text
        await tx.candidateSkill.deleteMany({
          where: { candidateProfileId: profile.id },
        });

        if (parsedData.skills.length > 0) {
          await tx.candidateSkill.createMany({
            data: parsedData.skills.map((skill) => ({
              candidateProfileId: profile.id,
              name: skill,
            })),
          });
        }
      }

      // Upsert Job Preferences (update with newly extracted data)
      await tx.jobPreference.upsert({
        where: { candidateProfileId: profile.id },
        update: {
          roles: parsedData.suggestedRoles,
          locations: parsedData.location ? [parsedData.location] : [],
        },
        create: {
          candidateProfileId: profile.id,
          roles: parsedData.suggestedRoles,
          locations: parsedData.location ? [parsedData.location] : [],
        },
      });
    });

    return NextResponse.json({ message: "Resume processed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ message: error?.message || "Failed to process resume" }, { status: 500 });
  }
}

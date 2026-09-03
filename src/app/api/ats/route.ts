import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractTextFromPdf } from "@/lib/resume/parser";
import { analyzeResume } from "@/lib/ats/engine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const useExisting = formData.get("useExisting") === "true";
    
    let rawText = "";

    if (useExisting) {
      const resume = await db.resume.findUnique({ where: { userId: session.user.id } });
      if (!resume || !resume.rawText) {
        return NextResponse.json({ message: "No existing resume found. Please upload one." }, { status: 404 });
      }
      rawText = resume.rawText;
    } else {
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json({ message: "Only PDF files are supported" }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "Your resume is too large. Please upload a smaller PDF." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      rawText = await extractTextFromPdf(buffer);
      
      if (!rawText || rawText.trim().length === 0) {
        return NextResponse.json({ message: "That file doesn't appear to contain readable text. Try uploading a text-based PDF." }, { status: 400 });
      }
    }

    const result = analyzeResume(rawText);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("ATS checking error:", error);
    return NextResponse.json({ message: "Failed to analyze resume." }, { status: 500 });
  }
}

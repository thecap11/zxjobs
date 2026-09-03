import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { source, sourceJobId, title, company, location, applicationUrl } = body;

    // Check if already saved
    const exists = await db.savedJob.findUnique({
      where: {
        userId_applicationUrl: {
          userId: session.user.id,
          applicationUrl: applicationUrl,
        }
      }
    });

    if (exists) {
      return NextResponse.json({ message: "Job already saved" }, { status: 400 });
    }

    const savedJob = await db.savedJob.create({
      data: {
        userId: session.user.id,
        source,
        sourceJobId,
        title,
        company,
        location,
        applicationUrl,
      },
    });

    // Also auto-add to applications as "Saved"
    await db.application.create({
      data: {
        userId: session.user.id,
        source,
        sourceJobId,
        title,
        company,
        applicationUrl,
        status: "Saved",
      }
    });

    return NextResponse.json(savedJob, { status: 201 });
  } catch (error) {
    console.error("Save Job API Error:", error);
    return NextResponse.json({ message: "Failed to save job" }, { status: 500 });
  }
}

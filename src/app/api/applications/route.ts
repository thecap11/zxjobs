import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const applications = await db.application.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(applications);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, status, notes } = await req.json();

  const app = await db.application.findUnique({ where: { id } });
  if (!app || app.userId !== session.user.id) {
    return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
  }

  const updated = await db.application.update({
    where: { id },
    data: { 
      status, 
      notes,
      appliedAt: status === "Applied" && !app.appliedAt ? new Date() : undefined
    }
  });

  return NextResponse.json(updated);
}

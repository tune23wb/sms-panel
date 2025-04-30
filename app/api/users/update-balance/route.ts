import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, PrismaClient } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId, amount, description } = body;

    if (!userId || !amount || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Start a transaction to ensure both balance update and transaction record are created
    const result = await prisma.$transaction(async (tx) => {
      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: amount > 0 ? "CREDIT" : "DEBIT",
          amount: Math.abs(amount),
          description,
          userId,
          status: "COMPLETED"
        }
      });

      return { user: updatedUser, transaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[USERS_UPDATE_BALANCE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
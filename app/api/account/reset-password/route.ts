import { NextRequest, NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";
import { account } from "@/app/node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId, secret, password } = body;

    await account.updateRecovery(userId, secret, password);

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof AppwriteException)
      return NextResponse.json({ message: err.message }, { status: err.code });

    if (err instanceof Error)
      return NextResponse.json({ message: err.message }, { status: 500 });

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

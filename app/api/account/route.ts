import { NextRequest, NextResponse } from "next/server";
import { AppwriteException, Query } from "node-appwrite";
import {
  accountWithJwt,
  avatars,
  databases,
  storage,
  users,
} from "@/app/node-appwrite";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer"))
      return NextResponse.json({ message: "Invalid token" }, { status: 500 });

    const [_, token] = authHeader?.split(" ");

    const account = accountWithJwt(token);

    const user = await account.get();

    if (!user?.prefs?.image)
      user.prefs.image =
        "data:image/jpeg;base64," +
        Buffer.from(
          await avatars.getInitials(user?.name ?? user?.email),
        ).toString("base64");

    return NextResponse.json(
      { message: "Account fetched successfully", data: user },
      { status: 200 },
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

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    const body = await req.json();

    if (!authHeader?.startsWith("Bearer"))
      return NextResponse.json({ message: "Invalid token" }, { status: 500 });

    const [_, token] = authHeader?.split(" ");

    const account = accountWithJwt(token);

    const user = await account.get();

    await account.updatePassword(body.password, body.password);

    const expenses = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID as string,
      "expense",
      [Query.equal("userId", user.$id)],
    );

    const categories = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID as string,
      "category",
      [Query.equal("userId", user.$id)],
    );

    await Promise.all([
      ...expenses.documents.map((doc) =>
        databases.deleteDocument(
          process.env.APPWRITE_DATABASE_ID as string,
          "expense",
          doc.$id,
        ),
      ),
      ...categories.documents.map((doc) =>
        databases.deleteDocument(
          process.env.APPWRITE_DATABASE_ID as string,
          "category",
          doc.$id,
        ),
      ),
    ]);

    if (user?.prefs?.image) {
      storage.deleteFile(process.env.APPWRITE_BUCKET_ID as string, user.$id);
    }

    await account.deleteSessions();

    await users.delete(user.$id);

    return NextResponse.json(
      { message: "Account deleted successfully" },
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

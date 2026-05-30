import { executeCode } from "@/lib/piston/client";
import { NextResponse } from "next/server";
import { z } from "zod";

// Fix for Windows Node.js SSL — no effect on Vercel/Linux
if (process.platform === "win32") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const executeSchema = z.object({
  language: z.string().min(1),
  version: z.string().min(1),
  code: z.string().min(1, "Code cannot be empty"),
  stdin: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = executeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { language, version, code, stdin } = parsed.data;

    const result = await executeCode({ language, version, code, stdin });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Code execution failed",
      },
      { status: 500 }
    );
  }
}
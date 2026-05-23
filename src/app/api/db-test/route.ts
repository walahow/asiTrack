import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import Admin from "@/models/Admin";
import Question from "@/models/Question";
import Response from "@/models/Response";
import Article from "@/models/Article";
import Video from "@/models/Video";
import NotificationTemplate from "@/models/NotificationTemplate";

export async function GET() {
  const reports: any = {
    status: "success",
    timestamp: new Date().toISOString(),
    mongoose_helper: "Loaded successfully",
    models: {
      User: typeof User === "function" ? "Loaded & Compiled" : "Failed",
      Admin: typeof Admin === "function" ? "Loaded & Compiled" : "Failed",
      Question: typeof Question === "function" ? "Loaded & Compiled" : "Failed",
      Response: typeof Response === "function" ? "Loaded & Compiled" : "Failed",
      Article: typeof Article === "function" ? "Loaded & Compiled" : "Failed",
      Video: typeof Video === "function" ? "Loaded & Compiled" : "Failed",
      NotificationTemplate: typeof NotificationTemplate === "function" ? "Loaded & Compiled" : "Failed",
    },
    database_connection: "Skipped",
  };

  try {
    if (process.env.MONGODB_URI) {
      await dbConnect();
      reports.database_connection = "Connected successfully!";
    } else {
      reports.database_connection = "Pending (MONGODB_URI missing in .env.local, local schema compilation verified)";
    }
  } catch (error: any) {
    reports.status = "error";
    reports.database_connection = `Failed to connect: ${error.message}`;
  }

  return NextResponse.json(reports);
}

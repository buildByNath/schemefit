import { NextRequest, NextResponse } from "next/server";
import { sendSchemeEmailNotification } from "@/lib/email";
import { getSchemes } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schemeId, userEmail, userName } = body;

    if (!schemeId || !userEmail || !userName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: schemeId, userEmail, userName" },
        { status: 400 }
      );
    }

    // Look up scheme details
    const schemes = await getSchemes();
    const scheme = schemes.find((s) => s.id === schemeId);

    if (!scheme) {
      return NextResponse.json(
        { success: false, error: "Scheme not found" },
        { status: 404 }
      );
    }

    const formattedDeadline = scheme.deadline
      ? new Date(scheme.deadline).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC"
        })
      : "No deadline";

    const result = await sendSchemeEmailNotification({
      toEmail: userEmail,
      userName,
      schemeTitle: scheme.title,
      providerType: (scheme.provider_type as "Government" | "NGO" | "Private Sector") || "Government",
      benefitAmount: scheme.max_benefit_amount || 0,
      deadline: formattedDeadline,
      portalUrl: scheme.application_url || "https://schemefit.com/dashboard",
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: `Reminder email sent successfully to ${userEmail}`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Send reminder API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

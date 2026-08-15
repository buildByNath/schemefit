import { NextResponse } from "next/server";
import { getUser, getSchemes, createApplication } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schemeId, schemeTitle, action } = body;
    
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schemes = await getSchemes();

    // Find scheme by ID or title match
    const scheme = schemes.find(s => 
      (schemeId && s.id === schemeId) || 
      (schemeTitle && s.title.toLowerCase().includes(schemeTitle.toLowerCase()))
    );

    if (!scheme) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 400 });
    }

    // Handle application submission recording
    if (action === "submit") {
      const application = await createApplication(user.id, scheme.id);
      return NextResponse.json({ 
        success: true, 
        message: "Application recorded successfully in database.",
        application 
      });
    }

    // Determine target URL for redirection
    let redirectUrl = scheme.application_url && scheme.application_url.startsWith('http') 
      ? scheme.application_url 
      : `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.title)}`;

    const isUas = scheme.title.toLowerCase().includes("unemployment allowance");
    if (isUas) {
      // Serve the HTML file from public directory
      redirectUrl = "/unemployment_allowance_scheme_hp.html";
    }

    return NextResponse.json({ 
      success: true, 
      redirectUrl
    });

  } catch (error: any) {
    console.error("Apply real failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


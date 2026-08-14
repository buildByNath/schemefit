"use client";

import React, { useState } from "react";
import { FileCheck, FileX, AlertTriangle, Clock, FileDown, Loader2, IndianRupee, Sparkles, CheckCircle2 } from "lucide-react";
import { Application, User } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface ApplicationsListProps {
  applications: Application[];
  user: User;
}

export function ApplicationsList({ applications: initialApplications, user }: ApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "delayed":
        return "bg-amber-50 text-amber-700 border-amber-250";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case "rejected":
        return <FileX className="h-5 w-5 text-rose-600" />;
      case "delayed":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600 animate-spin-slow" />;
    }
  };

  const generateGrievancePDF = async (app: Application) => {
    if (!app.scheme) return;
    setGeneratingId(app.id);
    
    try {
      // 1. Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // A4 page dimensions
      const width = 595.276;
      const height = 841.890;
      const page = pdfDoc.addPage([width, height]);
      
      // 2. Embed standard fonts
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Margins
      const marginX = 50;
      let currentY = height - 60;
      
      // Draw text helper
      const drawText = (text: string, size = 11, isBold = false, yOffset = 18) => {
        page.drawText(text, {
          x: marginX,
          y: currentY,
          size,
          font: isBold ? boldFont : font,
          color: rgb(0.08, 0.12, 0.20), // slate-900 color
        });
        currentY -= yOffset;
      };

      // Header Block
      drawText("FORMAL GRIEVANCE & STATUTORY RTI PETITION", 16, true, 25);
      drawText("UNDER PUBLIC GRIEVANCE REDRESSAL BILL & SECTION 6(1) OF THE RTI ACT, 2005", 10, true, 35);
      
      // Divider
      page.drawLine({
        start: { x: marginX, y: currentY + 10 },
        end: { x: width - marginX, y: currentY + 10 },
        thickness: 1,
        color: rgb(0.8, 0.82, 0.88), // border slate-200
      });
      
      // Meta Information block
      drawText(`Date: ${new Date().toLocaleDateString("en-IN")}`, 10, false, 15);
      drawText(`Complaint Reference ID: SCHEMEFIT-${app.id.substring(0, 8).toUpperCase()}`, 10, true, 25);
      
      // Address Block
      drawText("TO,", 11, true, 16);
      drawText("The Public Information Officer / Appellate Authority", 11, false, 16);
      drawText(`Department of ${app.scheme.ministry || "Social Justice & Welfare"}`, 11, false, 16);
      drawText(`State Secretariat, Government of Kerala`, 11, false, 30);
      
      // Subject Block
      drawText("SUBJECT:", 11, true, 16);
      const isRejected = app.status.toLowerCase() === "rejected";
      const subText = isRejected 
        ? `Grievance petition against the arbitrary rejection of Application for scheme: ${app.scheme.title}`
        : `Statutory request under RTI Act regarding extreme delay in processing Application for scheme: ${app.scheme.title}`;
      
      // Wrap subject text into lines
      const wrapText = (text: string, maxCharsPerLine = 75): string[] => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";
        
        words.forEach(word => {
          if ((currentLine + " " + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? " " : "") + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
      };
      
      const subLines = wrapText(subText);
      subLines.forEach(line => {
        drawText(line, 11, true, 16);
      });
      currentY -= 15; // extra space after subject
      
      // Respectful Opening
      drawText("Respected Sir/Madam,", 11, false, 25);
      
      // Body Paragraphs
      const introText = `I, the undersigned applicant ${user.full_name}, residing in Ernakulam, Kerala, hereby submit this formal petition concerning my welfare application filed through the SchemeFit portal. I belong to the ${user.caste_category} caste category, with an annual household income of Rs. ${user.annual_income?.toLocaleString("en-IN")} only, which places me fully within the specified eligibility criteria for this scheme.`;
      
      wrapText(introText).forEach(line => {
        drawText(line, 11, false, 16);
      });
      currentY -= 10;

      let grievanceDetail = "";
      if (isRejected) {
        grievanceDetail = `My application for the "${app.scheme.title}" was summarily REJECTED with the reason cited as: "${app.rejection_reason || "Not specified"}". I submit that my uploaded document criteria were fully authentic. Under the Citizen's Charter, I request a manual re-verification of my profile parameters. If the rejection remains, please provide the specific government order (G.O.) number and section under which this decision was made.`;
      } else {
        grievanceDetail = `My application for the "${app.scheme.title}" was submitted on ${app.submitted_at ? new Date(app.submitted_at).toLocaleDateString("en-IN") : "the portal"} and has been marked as PENDING/DELAYED for over 45 days. The statutory timelines for public service delivery dictate that a decision must be rendered within 30 days. Under Section 6(1) of the RTI Act, please provide: (a) Daily progress reports of my application file, and (b) The name and designation of the officer responsible for this delay.`;
      }

      wrapText(grievanceDetail).forEach(line => {
        drawText(line, 11, false, 16);
      });
      currentY -= 10;
      
      const statutoryNotice = "This petition is served in good faith to resolve administrative delay. Under the Right to Service Act, government officials are bound to process eligible files without harassment or unconstitutional delays. I request you to update my application status within 7 working days, failing which this matter will be escalated to the State Information Commission / Ombudsman.";
      
      wrapText(statutoryNotice).forEach(line => {
        drawText(line, 11, false, 16);
      });
      currentY -= 35;
      
      // Signature Block
      drawText("Yours faithfully,", 11, false, 35);
      drawText(`${user.full_name}`, 11, true, 14);
      drawText(`Category: ${user.caste_category} | Annual Income: Rs. ${user.annual_income?.toLocaleString("en-IN")}`, 9, false, 14);
      drawText(`Email: ${user.email}`, 9, false, 14);

      // Save and Trigger download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const docUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = docUrl;
      const filePrefix = isRejected ? "grievance_appeal" : "rti_delay_inquiry";
      link.setAttribute("download", `${filePrefix}_${app.id.substring(0, 6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(docUrl);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {applications.length === 0 ? (
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-12 text-center">
          <FileCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <CardTitle className="text-lg font-bold text-slate-800 mb-1">No Active Applications</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            You haven&apos;t applied to any schemes yet. Go to your <span className="font-semibold text-slate-700">Dashboard</span> to review eligible recommendations and apply.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app) => (
            <Card
              key={app.id}
              className={`bg-white shadow-sm rounded-xl border overflow-hidden ${
                app.status.toLowerCase() === "rejected"
                  ? "border-rose-200 bg-rose-50/10"
                  : app.status.toLowerCase() === "delayed"
                  ? "border-amber-200 bg-amber-50/10"
                  : "border-slate-200"
              }`}
            >
              <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={`font-semibold border text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </Badge>
                    <span className="text-slate-400 text-xs font-semibold">
                      Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : "Recent"}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                    {app.scheme?.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    {app.scheme?.ministry}
                  </CardDescription>
                </div>
                
                {app.scheme?.max_benefit_amount && (
                  <div className="flex items-center text-slate-900 font-extrabold text-xl sm:self-center">
                    <IndianRupee className="h-4.5 w-4.5 mr-0.5" />
                    {app.scheme.max_benefit_amount.toLocaleString("en-IN")}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {app.scheme?.description}
                </p>

                {/* Grievance / Rejection alert box */}
                {(app.status.toLowerCase() === "rejected" || app.status.toLowerCase() === "delayed") && (
                  <div className={`p-4 rounded-xl border flex gap-3 text-sm ${
                    app.status.toLowerCase() === "rejected"
                      ? "bg-rose-50 border-rose-100 text-rose-800"
                      : "bg-amber-50 border-amber-100 text-amber-800"
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {getStatusIcon(app.status)}
                    </div>
                    <div className="space-y-1">
                      <strong className="font-bold flex items-center gap-1">
                        {app.status.toLowerCase() === "rejected" ? "Application Disapproved" : "Service Timeline Exceeded"}
                      </strong>
                      <p className="leading-normal">
                        <strong>Reason:</strong> {app.rejection_reason || "Administrative verification pending beyond standard processing threshold."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-3 justify-end border-t border-slate-100/50 mt-4 pt-4">
                {(app.status.toLowerCase() === "rejected" || app.status.toLowerCase() === "delayed") ? (
                  <Button
                    onClick={() => generateGrievancePDF(app)}
                    disabled={generatingId !== null}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-2 cursor-pointer shadow"
                    style={{ minHeight: "48px" }}
                  >
                    {generatingId === app.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Compiling Statutory PDF...
                      </>
                    ) : (
                      <>
                        <FileDown className="h-5 w-5" /> Generate RTI / Grievance PDF
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" /> Application active on departmental queues
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

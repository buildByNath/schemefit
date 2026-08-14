"use client";

import React, { useTransition } from "react";
import { Calendar, CheckCircle2, ChevronRight, Loader2, IndianRupee } from "lucide-react";
import { Scheme } from "@/lib/db";
import { applyToScheme } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface SchemeCardProps {
  scheme: Scheme;
  hasApplied: boolean;
}

export function SchemeCard({ scheme, hasApplied }: SchemeCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDownloadICS = () => {
    if (!scheme.deadline) return;
    
    const deadlineDate = new Date(scheme.deadline);
    const deadlineStr = deadlineDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    // Create event that starts 1 day before the deadline as a reminder
    const startDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);
    const startStr = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SchemeFit//Scheme Calendar//EN",
      "BEGIN:VEVENT",
      `UID:deadline-${scheme.id}@schemefit.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}`,
      `DTSTART:${startStr}`,
      `DTEND:${deadlineStr}`,
      `SUMMARY:Apply for ${scheme.title}`,
      `DESCRIPTION:Reminder to submit your application for the ${scheme.title} scholarship/scheme before the deadline! Link: ${scheme.application_url || "https://schemefit.in"}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${scheme.title.toLowerCase().replace(/\s+/g, "-")}-deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    startTransition(async () => {
      const result = await applyToScheme(scheme.id);
      if (!result.success) {
        alert("Failed to submit application: " + result.error);
      }
    });
  };

  const formattedDeadline = scheme.deadline
    ? new Date(scheme.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

  return (
    <Card className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">
            {scheme.category || "General"}
          </Badge>
          {scheme.max_benefit_amount && (
            <div className="flex items-center text-emerald-600 font-bold text-lg">
              <IndianRupee className="h-4.5 w-4.5 mr-0.5" />
              {scheme.max_benefit_amount.toLocaleString("en-IN")}
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
          {scheme.title}
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs mt-1">
          {scheme.ministry}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 pb-4 flex-1">
        <p className="text-slate-600 text-sm leading-relaxed">
          {scheme.description}
        </p>
        
        {scheme.deadline && (
          <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-500">
            <Calendar className="h-4 w-4 text-slate-400" />
            Deadline: <span className="text-slate-800">{formattedDeadline}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-5 pt-0 border-t border-slate-100 flex gap-3 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadICS}
          disabled={!scheme.deadline}
          className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer text-xs"
          style={{ minHeight: "44px" }}
        >
          <Calendar className="h-4 w-4 mr-1.5" /> Save Deadline
        </Button>
        
        {hasApplied ? (
          <Button
            disabled
            variant="secondary"
            className="flex-1 bg-emerald-50 text-emerald-600 font-medium border border-emerald-100 text-xs"
            style={{ minHeight: "44px" }}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Applied
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isPending}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium cursor-pointer text-xs"
            style={{ minHeight: "44px" }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <>
                Apply Now <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

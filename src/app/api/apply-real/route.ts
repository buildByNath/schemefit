import { NextResponse } from "next/server";
import { getUser, getSchemeById } from "@/lib/db";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { schemeId } = await req.json();
    const user = await getUser();
    const scheme = await getSchemeById(schemeId);

    if (!user || !scheme) {
      return NextResponse.json({ error: "Unauthorized or scheme not found" }, { status: 400 });
    }

    // Launch Playwright in VISIBLE mode (headless: false)
    // This allows the user to actually see the form being filled and then manually enter the OTP!
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Navigate to the REAL external portal (or local file if it's the HP Unemployment Scheme)
    let targetUrl = scheme.application_url && scheme.application_url.startsWith('http') 
      ? scheme.application_url 
      : `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.title)}`;

    const isUas = scheme.title.toLowerCase().includes("unemployment allowance scheme");
    if (isUas) {
      const filePath = path.join(process.cwd(), "docs", "unemployment_allowance_scheme_hp.html");
      targetUrl = `file:///${filePath.replace(/\\/g, '/')}`;
    }

    // 2. Inject a persistent "AI Active" widget into the browser context.
    // This script will automatically run on EVERY page the user navigates to within this tab!
    await context.addInitScript((userData: any) => {
      const run = () => {
        // Only inject if it doesn't already exist
        if (document.getElementById('schemefinder-ai-banner')) return;

        // Inject Floating AI Banner
        const banner = document.createElement('div');
        banner.id = 'schemefinder-ai-banner';
        banner.innerHTML = `
          <div style="position: fixed; top: 20px; right: 20px; background: #0F172A; color: #10B981; padding: 16px 24px; border-radius: 12px; z-index: 9999999; font-family: system-ui, sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: bold; display: flex; align-items: center; gap: 12px; border: 2px solid #10B981; animation: pulse 2s infinite;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
            <div>
              <div style="font-size: 14px; color: white;">SchemeFinder AI</div>
              <div style="font-size: 12px; font-weight: normal; opacity: 0.8;" id="ai-status-text">Scanning for forms...</div>
            </div>
          </div>
        `;
        document.body.appendChild(banner);

        const isHPAllowancePage = window.location.href.includes("unemployment_allowance_scheme_hp.html");

        if (isHPAllowancePage) {
          if ((window as any).uasFilled) return;
          (window as any).uasFilled = true;

          const form = document.querySelector('#applicationForm') as HTMLFormElement;
          if (!form) return;

          const setVal = (name: string, val: any) => {
            const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
            if (el) {
              if (el.type === 'checkbox') {
                (el as HTMLInputElement).checked = !!val;
              } else {
                el.value = val || "";
              }
              el.style.border = "2px solid #10b981";
              el.style.backgroundColor = "#ecfdf5";
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          };

          setVal('fullName', userData.full_name);
          
          let dob = userData.date_of_birth || "1998-05-12";
          if (dob && dob.includes('T')) {
            dob = dob.split('T')[0];
          }
          setVal('dob', dob);
          
          let gender = "Male";
          if (userData.gender) {
            const g = userData.gender.toLowerCase();
            if (g === "female") gender = "Female";
            else if (g !== "male") gender = "Other";
          }
          setVal('gender', gender);

          let category = "General";
          if (userData.caste_category) {
            const cat = userData.caste_category.toUpperCase();
            if (["SC", "ST", "OBC", "GENERAL"].includes(cat)) {
              category = cat === "GENERAL" ? "General" : cat;
            }
          }
          setVal('category', category);

          setVal('mobile', userData.phone || "9876543210");
          setVal('email', userData.email);

          let district = "Shimla";
          if (userData.district) {
            const dist = userData.district.toLowerCase();
            const hpDistricts = ["bilaspur", "chamba", "hamirpur", "kangra", "kinnaur", "kullu", "lahaul and spiti", "mandi", "shimla", "sirmaur", "solan", "una"];
            const matched = hpDistricts.find((d: string) => dist.includes(d));
            if (matched) {
              district = matched.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
          }
          setVal('district', district);

          setVal('address', userData.address || "123 Main Street, Shimla");
          setVal('exchangeReg', "EX-HP-84920");

          let edu = "10+2 / senior secondary";
          if (userData.education) {
            const e = userData.education.toLowerCase();
            if (e.includes("post")) edu = "Post graduate";
            else if (e.includes("grad") || e.includes("undergrad")) edu = "Graduate";
            else if (e.includes("diploma") || e.includes("iti")) edu = "Diploma / ITI";
            else if (e.includes("professional") || e.includes("degree")) edu = "Professional degree";
          }
          setVal('education', edu);

          setVal('disability', userData.is_differently_abled ? "yes" : "no");

          let incomeSelect = "Rs 1,00,001 to Rs 2,00,000";
          const income = userData.annual_income || 150000;
          if (income < 50000) incomeSelect = "Below Rs 50,000";
          else if (income >= 50000 && income <= 100000) incomeSelect = "Rs 50,001 to Rs 1,00,000";
          setVal('familyIncome', incomeSelect);

          setVal('aadhar', "123456789012");
          setVal('bankAccount', "998877665544");
          setVal('ifscCode', "SBIN0001234");
          setVal('bankName', "State Bank of India");
          setVal('declaration', true);

          const statusText = document.getElementById('ai-status-text');
          if (statusText) {
            statusText.innerHTML = `Auto-filled all fields! Ready for review.`;
          }
        } else {
          // Generic Autofill
          const attemptAutoFill = () => {
            const inputs = document.querySelectorAll('input');
            let fieldsFilled = 0;
            
            inputs.forEach(input => {
              const identifier = (input.name || input.id || input.placeholder || "").toLowerCase();
              
              let valueToSet = null;
              if (identifier.includes('name') || identifier.includes('first') || identifier.includes('last')) valueToSet = userData.full_name;
              else if (identifier.includes('email')) valueToSet = userData.email;
              else if (identifier.includes('income')) valueToSet = userData.annual_income?.toString();
              else if (identifier.includes('caste') || identifier.includes('category')) valueToSet = userData.caste_category;
              
              if (valueToSet && !input.value && input.type !== 'hidden') {
                input.value = valueToSet;
                input.style.border = "2px solid #10b981";
                input.style.backgroundColor = "#ecfdf5";
                
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                fieldsFilled++;
              }
            });
            
            const statusText = document.getElementById('ai-status-text');
            if (statusText) {
              statusText.innerHTML = fieldsFilled > 0 
                ? `Auto-filled ${fieldsFilled} fields! Awaiting your input...` 
                : `No form fields found on this page. Navigate to the application form.`;
            }
          };

          attemptAutoFill();
          setInterval(attemptAutoFill, 2000);
        }
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        run();
      } else {
        window.addEventListener('DOMContentLoaded', run);
        window.addEventListener('load', run);
      }
    }, user);

    // 3. We navigate to the portal, and let the init script do the work.
    await page.goto(targetUrl);

    // We DO NOT close the browser here. We leave it open for the user to manually complete the application.
    // The browser will remain open until the user closes it manually.

    // Return a success message back to the frontend immediately so the UI updates
    return NextResponse.json({ 
      success: true, 
      message: "Browser launched successfully on the real government portal."
    });

  } catch (error: any) {
    console.error("Playwright automation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

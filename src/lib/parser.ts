export interface ParsedProfile {
  annual_income: number;
  caste_category: string;
  education: string;
  occupation: string;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  religion?: string | null;
  is_differently_abled?: boolean | null;
  bpl_status?: boolean | null;
  home_state?: string | null;
}

export function parseSpeechText(text: string): ParsedProfile {
  const lowercaseText = text.toLowerCase();
  
  // 1. Parse Income
  let income = 250000; // default fallback
  
  // Match "X.Y lakh" or "X lakh"
  const lakhMatch = lowercaseText.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lcs|lac|lacs)/);
  if (lakhMatch) {
    const value = parseFloat(lakhMatch[1]);
    income = Math.round(value * 100000);
  } else {
    // Match "X k" or "X thousand"
    const thousandMatch = lowercaseText.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand|thousands)/);
    if (thousandMatch) {
      const value = parseFloat(thousandMatch[1]);
      income = Math.round(value * 1000);
    } else {
      // Match raw numbers that look like income (e.g. 50000, 200000)
      const rawNumbers = lowercaseText.match(/\b\d{4,8}\b/g);
      if (rawNumbers && rawNumbers.length > 0) {
        // take the largest number found
        const numbers = rawNumbers.map(n => parseInt(n, 10));
        income = Math.max(...numbers);
      }
    }
  }

  // 2. Parse Caste Category
  let category = "General";
  if (lowercaseText.includes("obc")) {
    category = "OBC";
  } else if (lowercaseText.includes("sc") && !lowercaseText.includes("school")) {
    category = "SC";
  } else if (lowercaseText.includes("st") && !lowercaseText.includes("student")) {
    // Be careful with "st" in other words, check for boundaries if possible
    // Use regex to find "st" as a word or near user categories
    const stMatch = /\b(st)\b/.test(lowercaseText);
    if (stMatch) {
      category = "ST";
    }
  }

  // 3. Parse Education
  let education = "Undergraduate"; // default
  if (lowercaseText.includes("postgraduate") || lowercaseText.includes("post-graduate") || lowercaseText.includes("pg") || lowercaseText.includes("master")) {
    education = "Postgraduate";
  } else if (lowercaseText.includes("school") || lowercaseText.includes("matric") || lowercaseText.includes("12th") || lowercaseText.includes("10th")) {
    education = "School";
  } else if (lowercaseText.includes("undergraduate") || lowercaseText.includes("ug") || lowercaseText.includes("degree") || lowercaseText.includes("college") || lowercaseText.includes("student")) {
    education = "Undergraduate";
  }

  // 4. Parse Occupation
  let occupation = "Student";
  if (lowercaseText.includes("farmer") || lowercaseText.includes("agriculture") || lowercaseText.includes("farming")) {
    occupation = "Farmer";
  } else if (lowercaseText.includes("worker") || lowercaseText.includes("labor") || lowercaseText.includes("labour")) {
    occupation = "Worker";
  }

  return {
    annual_income: income,
    caste_category: category,
    education,
    occupation
  };
}

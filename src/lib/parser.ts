export interface ParsedProfile {
  full_name?: string | null;
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
  
  // 0. Parse Name
  let full_name: string | null = null;
  const nameMatch = text.match(/(?:i am|my name is|myself|name is)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
  if (nameMatch) {
    const candidate = nameMatch[1].trim();
    const firstWord = candidate.split(" ")[0].toLowerCase();
    if (!["an", "a", "the", "currently", "studying", "working"].includes(firstWord)) {
      full_name = candidate
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  // 1. Parse Income
  let income = 250000; // default fallback
  const lakhMatch = lowercaseText.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lcs|lac|lacs|l)/);
  if (lakhMatch) {
    const value = parseFloat(lakhMatch[1]);
    income = Math.round(value * 100000);
  } else {
    const thousandMatch = lowercaseText.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand|thousands)/);
    if (thousandMatch) {
      const value = parseFloat(thousandMatch[1]);
      income = Math.round(value * 1000);
    } else {
      const rawNumbers = lowercaseText.match(/\b\d{4,8}\b/g);
      if (rawNumbers && rawNumbers.length > 0) {
        const numbers = rawNumbers.map((n) => parseInt(n, 10));
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
  } else if (/\b(st)\b/.test(lowercaseText)) {
    category = "ST";
  }

  // 3. Parse Education
  let education = "Undergraduate";
  if (
    lowercaseText.includes("postgraduate") ||
    lowercaseText.includes("post-graduate") ||
    lowercaseText.includes("pg") ||
    lowercaseText.includes("master")
  ) {
    education = "Postgraduate";
  } else if (
    lowercaseText.includes("school") ||
    lowercaseText.includes("matric") ||
    lowercaseText.includes("12th") ||
    lowercaseText.includes("10th")
  ) {
    education = "School";
  } else if (
    lowercaseText.includes("undergraduate") ||
    lowercaseText.includes("ug") ||
    lowercaseText.includes("degree") ||
    lowercaseText.includes("college") ||
    lowercaseText.includes("student")
  ) {
    education = "Undergraduate";
  }

  // 4. Parse Occupation
  let occupation = "Student";
  if (
    lowercaseText.includes("farmer") ||
    lowercaseText.includes("agriculture") ||
    lowercaseText.includes("farming")
  ) {
    occupation = "Farmer";
  } else if (
    lowercaseText.includes("worker") ||
    lowercaseText.includes("labor") ||
    lowercaseText.includes("labour")
  ) {
    occupation = "Worker";
  } else if (
    lowercaseText.includes("ngo") ||
    lowercaseText.includes("private sector") ||
    lowercaseText.includes("company")
  ) {
    occupation = "NGO/Private sector";
  } else if (lowercaseText.includes("student")) {
    occupation = "Student";
  }

  // 5. Additional Flags & Metadata
  const bpl_status =
    lowercaseText.includes("bpl") || lowercaseText.includes("below poverty line");
  const is_differently_abled =
    lowercaseText.includes("differently abled") ||
    lowercaseText.includes("handicapped") ||
    lowercaseText.includes("disabled");

  let gender: string | null = null;
  if (/\b(female|woman|girl)\b/.test(lowercaseText)) {
    gender = "Female";
  } else if (/\b(male|man|boy)\b/.test(lowercaseText)) {
    gender = "Male";
  }

  return {
    full_name,
    annual_income: income,
    caste_category: category,
    education,
    occupation,
    bpl_status,
    is_differently_abled,
    gender,
  };
}


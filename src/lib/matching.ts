import { User, Scheme } from "./db";

export function getEligibleSchemes(user: User, schemes: Scheme[]): Scheme[] {
  return schemes.filter(scheme => {
    // If the scheme is inactive, skip
    if (scheme.status === "Inactive") return false;
    
    const rules = scheme.eligibility_json || {};
    
    // 1. Annual Income check (if user has income and rule defines max_income)
    if (rules.max_income !== undefined && user.annual_income !== undefined && user.annual_income !== null) {
      if (user.annual_income > rules.max_income) {
        return false;
      }
    }
    
    // 2. Caste/Category check
    if (rules.category !== undefined && user.caste_category) {
      const allowedCategories = Array.isArray(rules.category) ? rules.category : [rules.category];
      // Convert all to uppercase for case insensitive comparison
      const userCat = user.caste_category.toUpperCase();
      const match = allowedCategories.some((cat: string) => cat.toUpperCase() === userCat);
      if (!match) {
        return false;
      }
    }
    
    // 3. State check
    if (rules.states !== undefined && user.state) {
      const allowedStates = Array.isArray(rules.states) ? rules.states : [rules.states];
      const match = allowedStates.some((st: string) => 
        st.toLowerCase() === "all" || st.toLowerCase() === user.state?.toLowerCase()
      );
      if (!match) {
        return false;
      }
    }

    // 4. Education level check
    if (rules.education !== undefined && user.education) {
      const allowedEd = Array.isArray(rules.education) ? rules.education : [rules.education];
      const userEd = user.education.toLowerCase().trim();
      // Normalize common Indian education abbreviations for broader matching
      const educationAliases: Record<string, string[]> = {
        "btech": ["undergraduate", "b.tech", "b.e.", "btech", "professional courses"],
        "b.tech": ["undergraduate", "btech", "b.e.", "b.tech", "professional courses"],
        "b.e.": ["undergraduate", "btech", "b.tech", "b.e.", "professional courses"],
        "mtech": ["postgraduate", "m.tech", "mtech"],
        "m.tech": ["postgraduate", "mtech", "m.tech"],
        "mbbs": ["undergraduate", "mbbs", "professional courses"],
        "mba": ["postgraduate", "mba"],
        "bsc": ["undergraduate", "b.sc", "bsc"],
        "msc": ["postgraduate", "m.sc", "msc", "integrated m.sc"],
        "phd": ["postgraduate", "phd", "doctoral"],
        "high school": ["high school", "class 12", "class 11 to 12"],
        "diploma": ["diploma", "polytechnic", "iti"],
      };
      const userAliases = educationAliases[userEd] || [userEd];
      const match = allowedEd.some((ed: string) => 
        userAliases.includes(ed.toLowerCase()) || ed.toLowerCase() === userEd
      );
      if (!match) {
        return false;
      }
    }

    // 5. Occupation check
    if (rules.occupation !== undefined && user.occupation) {
      const allowedOcc = Array.isArray(rules.occupation) ? rules.occupation : [rules.occupation];
      const match = allowedOcc.some((occ: string) => occ.toLowerCase() === user.occupation?.toLowerCase());
      if (!match) {
        return false;
      }
    }

    // 6. Gender check — use actual user gender from profile
    if (rules.gender !== undefined && user.gender) {
      const allowedGender = Array.isArray(rules.gender) ? rules.gender : [rules.gender];
      const userGender = user.gender.toLowerCase().trim();
      const match = allowedGender.some((g: string) => g.toLowerCase() === userGender);
      if (!match) {
        return false;
      }
    }
    
    return true;
  });
}

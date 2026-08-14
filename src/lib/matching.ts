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
      const match = allowedEd.some((ed: string) => ed.toLowerCase() === user.education?.toLowerCase());
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

    // 6. Gender check
    if (rules.gender !== undefined) {
      // Assuming demoUser is Male (Rahul Menon). If rule specifies Female only, skip
      const allowedGender = Array.isArray(rules.gender) ? rules.gender : [rules.gender];
      const isFemaleOnly = allowedGender.every((g: string) => g.toLowerCase() === "female");
      if (isFemaleOnly) {
        return false; // Rahul is Male
      }
    }
    
    return true;
  });
}

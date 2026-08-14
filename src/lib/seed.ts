import { supabase } from "./supabase";

export const demoUser = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Rahul Menon",
  email: "rahul@demo.schemefit.in",
  annual_income: 250000,
  caste_category: "OBC",
  state: "Kerala",
  district: "Ernakulam",
  occupation: "Student",
  education: "Undergraduate",
  uploaded_documents: ["Aadhaar", "Bank Passbook", "Institution ID", "Mark Sheet", "Passport Photo", "Income Certificate", "Caste Certificate"]
};

export const customUser = {
  id: "00000000-0000-0000-0000-000000000002",
  full_name: "Guest User",
  email: "guest@schemefit.in",
  annual_income: null,
  caste_category: null,
  state: null,
  district: null,
  occupation: null,
  education: null,
  voice_raw_text: null,
  uploaded_documents: []
};

export const demoFamily = [
  {
    id: "family-member-0000-0000-0000-000000000001",
    user_id: demoUser.id,
    name: "Suresh Menon",
    relation: "Father",
    age: 50,
    occupation: "Farmer",
    annual_income: 150000,
    education: "High School",
    claimed_benefits: [
      { scheme_title: "PM Kisan Samman Nidhi (PM-KISAN)", amount: 6000, status: "Approved" }
    ]
  },
  {
    id: "family-member-0000-0000-0000-000000000002",
    user_id: demoUser.id,
    name: "Geetha Menon",
    relation: "Mother",
    age: 45,
    occupation: "Homemaker",
    annual_income: 0,
    education: "High School",
    claimed_benefits: [
      { scheme_title: "Women Entrepreneurship Assistance", amount: 50000, status: "Approved" }
    ]
  }
];

export const mockSchemes = [
  {
    title: "Kerala Higher Education Support Grant",
    description: "Financial assistance for undergraduate students from middle-income families.",
    min_benefit_amount: 10000,
    max_benefit_amount: 25000,
    eligibility_json: { max_income: 300000, category: ["OBC", "General"], states: ["Kerala"], education: ["Undergraduate"] },
    required_documents: ["Income Certificate", "Bonafide Certificate", "Aadhaar", "Bank Passbook"],
    prerequisites: ["Income Certificate", "Bonafide Certificate"],
    application_url: "https://egrantz.kerala.gov.in",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    state: "Kerala",
    ministry: "Higher Education Department"
  },
  {
    title: "National Merit Scholarship",
    description: "Central government scholarship for meritorious students pursuing higher education.",
    min_benefit_amount: 12000,
    max_benefit_amount: 12000,
    eligibility_json: { max_income: 450000, states: ["All"], education: ["Undergraduate", "Postgraduate"] },
    required_documents: ["Aadhaar", "Mark Sheet", "Income Certificate", "Passport Photo"],
    prerequisites: ["Income Certificate"],
    application_url: "https://scholarships.gov.in",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    state: "All",
    ministry: "Ministry of Education"
  },
  {
    title: "Student Digital Access Assistance",
    description: "One-time grant for students to purchase laptops or tablets for digital education.",
    min_benefit_amount: 5000,
    max_benefit_amount: 15000,
    eligibility_json: { max_income: 200000, category: ["SC", "ST", "OBC"], states: ["Kerala", "Tamil Nadu", "Karnataka"] },
    required_documents: ["Institution ID", "Quotation", "Bank Passbook"],
    prerequisites: ["Institution ID"],
    application_url: "https://digitalindia.gov.in/students",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Technology",
    state: "Multiple",
    ministry: "MeitY"
  },
  {
    title: "Farmer Family Education Support",
    description: "Support for children of agricultural workers and farmers.",
    min_benefit_amount: 8000,
    max_benefit_amount: 15000,
    eligibility_json: { occupation: ["Farmer", "Agricultural Worker"], states: ["All"] },
    required_documents: ["Farmer ID/Kisan Card", "Aadhaar", "Bonafide Certificate"],
    prerequisites: ["Farmer ID/Kisan Card"],
    application_url: "https://pmkisan.gov.in/education",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Agriculture",
    state: "All",
    ministry: "Ministry of Agriculture"
  },
  {
    title: "Women Entrepreneurship Assistance",
    description: "Financial support and training for women starting new ventures.",
    min_benefit_amount: 50000,
    max_benefit_amount: 200000,
    eligibility_json: { gender: ["Female"], max_income: 500000 },
    required_documents: ["Project Report", "Aadhaar", "Bank Details"],
    prerequisites: ["Project Report"],
    application_url: "https://msme.gov.in/women-entrepreneurs",
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Business",
    state: "All",
    ministry: "Ministry of MSME"
  },
  {
    title: "PM Kisan Samman Nidhi (PM-KISAN)",
    description: "Central sector scheme providing income support of ₹6,000 per year in three equal installments to all landholding farmer families.",
    min_benefit_amount: 6000,
    max_benefit_amount: 6000,
    eligibility_json: { occupation: ["Farmer", "Agricultural Worker"], states: ["All"] },
    required_documents: ["Land Possession Certificate", "Aadhaar", "Bank Passbook", "Citizen ID"],
    prerequisites: ["Land Possession Certificate"],
    application_url: "https://pmkisan.gov.in",
    deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Agriculture",
    state: "All",
    ministry: "Ministry of Agriculture & Farmers Welfare"
  },
  {
    title: "PM Garib Kalyan Anna Yojana (PMGKAY)",
    description: "A food security welfare scheme providing free food grains to eligible families under Priority Households (PHH) and Antyodaya Anna Yojana (AAY).",
    min_benefit_amount: 1000,
    max_benefit_amount: 5000,
    eligibility_json: { max_income: 100000, states: ["All"] },
    required_documents: ["Ration Card", "Aadhaar", "Income Certificate"],
    prerequisites: ["Ration Card"],
    application_url: "https://dfpd.gov.in",
    deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Social Welfare",
    state: "All",
    ministry: "Ministry of Consumer Affairs, Food and Public Distribution"
  },
  {
    title: "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
    description: "Interest subsidy on home loans for purchase, construction, or enhancement of houses under Credit Linked Subsidy Scheme (CLSS) for EWS/LIG.",
    min_benefit_amount: 150000,
    max_benefit_amount: 267000,
    eligibility_json: { max_income: 600000, states: ["All"] },
    required_documents: ["Income Certificate", "Aadhaar", "Affidavit of landless household", "Bank Account Details"],
    prerequisites: ["Income Certificate"],
    application_url: "https://pmay-urban.gov.in",
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Housing",
    state: "All",
    ministry: "Ministry of Housing and Urban Affairs"
  },
  {
    title: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    description: "Cashless health cover up to ₹5 lakh per family per year for secondary and tertiary care hospitalization in empaneled public and private hospitals.",
    min_benefit_amount: 100000,
    max_benefit_amount: 500000,
    eligibility_json: { max_income: 250000, category: ["SC", "ST", "OBC"], states: ["All"] },
    required_documents: ["PM-JAY Card/Ration Card", "Aadhaar", "Income Certificate"],
    prerequisites: ["Income Certificate"],
    application_url: "https://pmjay.gov.in",
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Healthcare",
    state: "All",
    ministry: "Ministry of Health and Family Welfare"
  },
  {
    title: "Atal Pension Yojana (APY)",
    description: "Guaranteed minimum pension of ₹1,000 to ₹5,000 per month for workers in the unorganized sectors after attaining the age of 60.",
    min_benefit_amount: 12000,
    max_benefit_amount: 60000,
    eligibility_json: { occupation: ["Unorganized Sector", "Worker", "Farmer", "Artisan"], states: ["All"] },
    required_documents: ["Savings Bank Account", "Aadhaar", "Mobile Number"],
    prerequisites: ["Savings Bank Account"],
    application_url: "https://www.npscra.nsdl.co.in",
    deadline: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Social Security",
    state: "All",
    ministry: "Ministry of Finance"
  },
  {
    title: "Sukanya Samriddhi Yojana (SSY)",
    description: "A small deposit savings scheme targeted at parents of girl children, offering high interest rate and tax exemption for education/marriage.",
    min_benefit_amount: 250,
    max_benefit_amount: 150000,
    eligibility_json: { gender: ["Female"], states: ["All"] },
    required_documents: ["Birth Certificate of Girl Child", "Identity Proof of Parent", "Address Proof"],
    prerequisites: ["Birth Certificate of Girl Child"],
    application_url: "https://www.nsiindia.gov.in",
    deadline: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Social Welfare",
    state: "All",
    ministry: "Ministry of Finance"
  },
  {
    title: "Pradhan Mantri Mudra Yojana (PMMY)",
    description: "Collateral-free loans up to ₹10 Lakh to micro and small non-corporate enterprises to kickstart or expand their business ventures.",
    min_benefit_amount: 50000,
    max_benefit_amount: 1000000,
    eligibility_json: { occupation: ["Entrepreneur", "Business Owner", "Trader", "Artisan"], states: ["All"] },
    required_documents: ["Business Plan/Proposal", "Identity & Address Proof", "Equipment/Asset Quotations"],
    prerequisites: ["Business Plan/Proposal"],
    application_url: "https://www.mudra.org.in",
    deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Business",
    state: "All",
    ministry: "Ministry of Finance"
  },
  {
    title: "Post-Matric Scholarship for SC/ST/OBC Students",
    description: "Centrally sponsored scholarship scheme offering financial assistance to post-secondary students belonging to disadvantaged categories.",
    min_benefit_amount: 3000,
    max_benefit_amount: 12000,
    eligibility_json: { max_income: 250000, category: ["SC", "ST", "OBC"], states: ["All"], education: ["Undergraduate", "Postgraduate"] },
    required_documents: ["Caste Certificate", "Income Certificate", "Fee Receipt", "Mark Sheet"],
    prerequisites: ["Caste Certificate", "Income Certificate"],
    application_url: "https://scholarships.gov.in",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    state: "All",
    ministry: "Ministry of Social Justice and Empowerment"
  },
  {
    title: "PM Vishwakarma Scheme",
    description: "Support for traditional artisans and craftspeople through skill upgradation, toolkit incentives, and low-interest enterprise development loans.",
    min_benefit_amount: 15000,
    max_benefit_amount: 300000,
    eligibility_json: { occupation: ["Artisan", "Carpenter", "Blacksmith", "Sculptor", "Potter"], states: ["All"] },
    required_documents: ["Artisan Identity Card", "Aadhaar Card", "Bank Account Details"],
    prerequisites: ["Artisan Identity Card"],
    application_url: "https://pmvishwakarma.gov.in",
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Business",
    state: "All",
    ministry: "Ministry of Micro, Small and Medium Enterprises"
  },
  {
    title: "Kerala Vidyajyothi Scheme",
    description: "Scholarship assistance for physically handicapped students studying in Government and Aided educational institutions in Kerala.",
    min_benefit_amount: 4000,
    max_benefit_amount: 10000,
    eligibility_json: { states: ["Kerala"], education: ["Undergraduate", "Postgraduate", "High School"] },
    required_documents: ["Disability Certificate", "Bonafide Certificate", "Income Certificate"],
    prerequisites: ["Disability Certificate"],
    application_url: "http://sjd.kerala.gov.in",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    state: "Kerala",
    ministry: "Social Justice Department, Government of Kerala"
  }
];

export async function seedDatabase() {
  console.log("Seeding Database...");
  
  // 1. Insert Schemes
  const { error: schemeError } = await supabase.from("schemes").upsert(mockSchemes, { onConflict: "title" });
  if (schemeError) console.error("Error seeding schemes:", schemeError);
  else console.log("Schemes seeded successfully");

  // 2. Insert Users
  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert({ ...demoUser, id: demoUser.id }, { onConflict: "id" })
    .select()
    .single();
    
  if (userError) console.error("Error seeding demo user:", userError);
  else console.log("Demo user seeded successfully");

  const { error: customUserError } = await supabase
    .from("users")
    .upsert({ ...customUser, id: customUser.id }, { onConflict: "id" });
  if (customUserError) console.error("Error seeding custom user:", customUserError);

  // 3. Insert Family
  if (user) {
    const { error: familyError } = await supabase
      .from("family_members")
      .upsert(demoFamily, { onConflict: "id" });
      
    if (familyError) console.error("Error seeding family:", familyError);
    else console.log("Family seeded successfully");
  }

  return { success: !schemeError && !userError && !customUserError };
}

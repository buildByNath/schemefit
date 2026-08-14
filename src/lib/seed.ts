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
    title: "Tata Trusts Higher Education Scholarship",
    description: "Merit-cum-means scholarship funded by Tata Trusts for undergraduate students in Science, Engineering, and Healthcare.",
    min_benefit_amount: 25000,
    max_benefit_amount: 60000,
    eligibility_json: { max_income: 400000, category: ["OBC", "General", "SC", "ST"], states: ["All"], education: ["Undergraduate"] },
    required_documents: ["Income Certificate", "Mark Sheet", "Aadhaar", "Institution Fee Receipt"],
    prerequisites: ["Income Certificate", "Mark Sheet"],
    application_url: "https://www.tatatrusts.org/scholarships",
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    state: "All",
    ministry: "Tata Group CSR Division",
    provider_type: "Private Sector",
    provider_name: "Tata Trusts"
  },
  {
    title: "Smile Foundation STEM Girl Excellence Grant",
    description: "NGO grant supporting female undergraduate students pursuing STEM and technology degrees across India.",
    min_benefit_amount: 15000,
    max_benefit_amount: 35000,
    eligibility_json: { gender: ["Female"], max_income: 300000, states: ["All"], education: ["Undergraduate"] },
    required_documents: ["Aadhaar", "Mark Sheet", "Bonafide Certificate", "Income Certificate"],
    prerequisites: ["Bonafide Certificate"],
    application_url: "https://www.smilefoundationindia.org/scholarships",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    state: "All",
    ministry: "Smile Foundation NGO Network",
    provider_type: "NGO",
    provider_name: "Smile Foundation NGO"
  },
  {
    title: "Reliance Foundation Undergraduate Merit Scholarship",
    description: "Private sector scholarship providing financial aid and leadership development for outstanding Indian undergraduate students.",
    min_benefit_amount: 50000,
    max_benefit_amount: 200000,
    eligibility_json: { max_income: 600000, states: ["All"], education: ["Undergraduate"] },
    required_documents: ["Aadhaar", "12th Grade Mark Sheet", "Income Certificate"],
    prerequisites: ["Income Certificate"],
    application_url: "https://www.scholarships.reliancefoundation.org",
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    state: "All",
    ministry: "Reliance Foundation CSR",
    provider_type: "Private Sector",
    provider_name: "Reliance Foundation"
  },
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
    ministry: "Higher Education Department",
    provider_type: "Government",
    provider_name: "Government of Kerala"
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
    ministry: "Ministry of Education",
    provider_type: "Government",
    provider_name: "Government of India"
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
    ministry: "MeitY",
    provider_type: "Government",
    provider_name: "MeitY"
  },
  {
    title: "GiveIndia Rural Student Bright Future Grant",
    description: "Non-profit crowdfunding and corporate-partnered scholarship for low-income rural students.",
    min_benefit_amount: 12000,
    max_benefit_amount: 30000,
    eligibility_json: { max_income: 200000, states: ["All"] },
    required_documents: ["Income Certificate", "Aadhaar", "Mark Sheet"],
    prerequisites: ["Income Certificate"],
    application_url: "https://giveindia.org/scholarships",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Social Welfare",
    state: "All",
    ministry: "GiveIndia Foundation",
    provider_type: "NGO",
    provider_name: "GiveIndia NGO"
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
    ministry: "Ministry of Social Justice and Empowerment",
    provider_type: "Government",
    provider_name: "Government of India"
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

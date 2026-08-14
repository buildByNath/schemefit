import { supabase } from "./supabase";

export const demoUser = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Rahul Menon",
  email: "rahul@demo.saturnx.in",
  annual_income: 250000,
  caste_category: "OBC",
  state: "Kerala",
  district: "Ernakulam",
  occupation: "Student",
  education: "Undergraduate"
};

export const demoFamily = [
  { user_id: demoUser.id, name: "Suresh Menon", relation: "Father", age: 50, occupation: "Farmer", annual_income: 150000, education: "High School" },
  { user_id: demoUser.id, name: "Geetha Menon", relation: "Mother", age: 45, occupation: "Homemaker", annual_income: 0, education: "High School" }
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
  }
];

export async function seedDatabase() {
  console.log("Seeding Database...");
  
  // 1. Insert Schemes
  const { error: schemeError } = await supabase.from("schemes").upsert(mockSchemes, { onConflict: "title" });
  if (schemeError) console.error("Error seeding schemes:", schemeError);
  else console.log("Schemes seeded successfully");

  // 2. Insert User (Upsert based on email, though we need UUID to match demoUser.id, but upsert on email is safer)
  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert({ ...demoUser, id: demoUser.id }, { onConflict: "id" })
    .select()
    .single();
    
  if (userError) console.error("Error seeding user:", userError);
  else console.log("User seeded successfully");

  // 3. Insert Family
  if (user) {
    const { error: familyError } = await supabase
      .from("family_members")
      .upsert(demoFamily, { onConflict: "id" }); // Since we don't have predefined IDs for family, we'll just insert if they don't exist. Actually, let's just insert them safely.
      
    if (familyError) console.error("Error seeding family:", familyError);
    else console.log("Family seeded successfully");
  }

  return { success: !schemeError && !userError };
}

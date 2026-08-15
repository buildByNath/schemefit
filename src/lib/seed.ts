import { supabase } from "./supabase";

export const demoUser = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Nath.s",
  email: "nathshaj20006@gmail.com",
  annual_income: 250000,
  caste_category: "OBC",
  state: "Kerala",
  district: "palakkad",
  address: "palakkad",
  occupation: "Unemployed",
  education: "Btech",
  date_of_birth: "2001-01-17",
  gender: "Male",
  phone: "5698745621",
  is_differently_abled: false,
  aadhar: "587965458561",
  bank_account: "45620000125",
  ifsc_code: "SBIN0001234",
  bank_name: "SBI",
  exchange_reg: "EX-HP-40291",
  uploaded_documents: ["Aadhaar Card", "Bank Passbook", "Marksheet", "Employment Registration Card", "Income Certificate", "Bonafide Himachali Certificate", "Declaration Form C"]
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
  // Originally Present Schemes
  {
    title: "Tata Trusts Higher Education Scholarship",
    description: "Merit-cum-means scholarship funded by Tata Trusts for undergraduate students in Science, Engineering, and Healthcare.",
    min_benefit_amount: 25000,
    max_benefit_amount: 60000,
    eligibility_json: { max_income: 400000, category: ["OBC", "General", "SC", "ST"], states: ["All"], education: ["Undergraduate"] },
    required_documents: ["Income Certificate", "Marksheet", "Aadhaar Card", "College ID Card"],
    prerequisites: ["Income Certificate", "Marksheet"],
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
    required_documents: ["Aadhaar Card", "Marksheet", "College ID Card", "Income Certificate"],
    prerequisites: ["College ID Card"],
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
    required_documents: ["Aadhaar Card", "Marksheet", "Income Certificate"],
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
    required_documents: ["Income Certificate", "College ID Card", "Aadhaar Card", "Bank Passbook"],
    prerequisites: ["Income Certificate", "College ID Card"],
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
    required_documents: ["Aadhaar Card", "Marksheet", "Income Certificate", "Passport Photo"],
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
    required_documents: ["College ID Card", "Quotation Document", "Bank Passbook"],
    prerequisites: ["College ID Card"],
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
    required_documents: ["Income Certificate", "Aadhaar Card", "Marksheet"],
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
    required_documents: ["Caste Certificate", "Income Certificate", "Marksheet", "Aadhaar Card"],
    prerequisites: ["Caste Certificate", "Income Certificate"],
    application_url: "https://scholarships.gov.in",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Education",
    state: "All",
    ministry: "Ministry of Social Justice and Empowerment",
    provider_type: "Government",
    provider_name: "Government of India"
  },

  // 20 New Schemes from PDF
  {
    title: "Central Sector Scheme of Scholarship for College and University Students",
    description: "A flagship central government initiative aimed at providing direct financial support to meritorious students from economically disadvantaged backgrounds to meet their day-to-day expenses while pursuing undergraduate and postgraduate higher education.",
    min_benefit_amount: 20000,
    max_benefit_amount: 20000,
    eligibility_json: { max_income: 450000, education: ["Undergraduate", "Postgraduate", "Professional Courses"], states: ["All"] },
    required_documents: ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Marksheet", "Bank Passbook"],
    prerequisites: ["Income Certificate", "Marksheet"],
    application_url: "https://www.buddy4study.com/article/central-scholarships",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Higher Education",
    state: "All",
    ministry: "Ministry of Education",
    provider_type: "Government",
    provider_name: "Ministry of Education"
  },
  {
    title: "NSP Central Sector Scholarship for Top-Class Education for SC Students",
    description: "Provides comprehensive financial support including full tuition fee coverage, living expenses, stationary allowances, and device grants to SC students who secure admission in notified top-class institutions.",
    min_benefit_amount: 200000,
    max_benefit_amount: 200000,
    eligibility_json: { max_income: 800000, category: ["SC"], education: ["Undergraduate", "Postgraduate"], states: ["All"] },
    required_documents: ["Caste Certificate", "Aadhaar Card", "Income Certificate", "College ID Card", "Bank Passbook"],
    prerequisites: ["Caste Certificate", "Income Certificate"],
    application_url: "https://www.buddy4study.com/article/government-scholarships-neet-candidates",
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Top-Class Education",
    state: "All",
    ministry: "Ministry of Social Justice and Empowerment",
    provider_type: "Government",
    provider_name: "Ministry of Social Justice and Empowerment"
  },
  {
    title: "PM YASASVI Central Sector Scheme of Top Class Education",
    description: "An initiative empowering students from socially and economically disadvantaged backgrounds, providing full tuition fee coverage and living expenses for students belonging to OBC, EBC, and DNT categories enrolled in notified institutions.",
    min_benefit_amount: 200000,
    max_benefit_amount: 200000,
    eligibility_json: { max_income: 250000, category: ["OBC", "EBC", "DNT"], education: ["Class 9 to 12", "Undergraduate"], states: ["All"] },
    required_documents: ["Caste Certificate", "Income Certificate", "Aadhaar Card", "College ID Card", "Bank Passbook"],
    prerequisites: ["Caste Certificate", "Income Certificate"],
    application_url: "https://www.buddy4study.com/article/national-scholarship-portal",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Top-Class Education",
    state: "All",
    ministry: "Ministry of Social Justice & Empowerment",
    provider_type: "Government",
    provider_name: "Ministry of Social Justice & Empowerment"
  },
  {
    title: "Post-Matric Scholarships for Minorities",
    description: "Financial assistance aimed at promoting education among economically weaker sections of minority communities, preventing dropouts from secondary education through to doctoral studies.",
    min_benefit_amount: 10000,
    max_benefit_amount: 10000,
    eligibility_json: { max_income: 200000, category: ["Muslims", "Christians", "Sikhs", "Buddhists", "Jains", "Parsis"], education: ["Class 11", "Class 12", "Undergraduate", "Postgraduate"], states: ["All"] },
    required_documents: ["Income Certificate", "Minority Certificate", "Aadhaar Card", "Marksheet", "Bank Passbook"],
    prerequisites: ["Income Certificate"],
    application_url: "https://www.buddy4study.com/article/state-scholarships",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Minority Welfare",
    state: "All",
    ministry: "Ministry of Minority Affairs",
    provider_type: "Government",
    provider_name: "Ministry of Minority Affairs"
  },
  {
    title: "INSPIRE Scholarship Programme (SHE)",
    description: "Offers substantial financial support to students ranking in the top 1% of Class 12 board examinations to pursue Natural and Basic Science courses, coupled with mandatory summer research projects.",
    min_benefit_amount: 60000,
    max_benefit_amount: 60000,
    eligibility_json: { education: ["B.Sc", "Integrated M.Sc", "B.S.", "M.S."], states: ["All"] },
    required_documents: ["Marksheet", "Board Rank Certificate", "Aadhaar Card", "College ID Card", "Bank Passbook"],
    prerequisites: ["Marksheet"],
    application_url: "https://www.buddy4study.com/article/government-scholarships",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Science and Research",
    state: "All",
    ministry: "Department of Science and Technology",
    provider_type: "Government",
    provider_name: "Department of Science and Technology"
  },
  {
    title: "Post Matric Scholarship for Students with Disabilities",
    description: "A comprehensive support scheme covering tuition and specific disability-related allowances such as reader charges and transport allowances for students with a benchmark disability of 40% or more.",
    min_benefit_amount: 4000,
    max_benefit_amount: 4000,
    eligibility_json: { max_income: 250000, education: ["Class 11", "Class 12", "Undergraduate", "Postgraduate"], differently_abled_required: true, states: ["All"] },
    required_documents: ["Disability Certificate", "Income Certificate", "Aadhaar Card", "College ID Card", "Bank Passbook"],
    prerequisites: ["Disability Certificate", "Income Certificate"],
    application_url: "https://www.buddy4study.com/article/means-scholarship",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Disability Welfare",
    state: "All",
    ministry: "Department of Empowerment of Persons with Disabilities",
    provider_type: "Government",
    provider_name: "Department of Empowerment of Persons with Disabilities"
  },
  {
    title: "Free Coaching Scheme for SC and OBC Students",
    description: "Provides specialized coaching fee assistance and monthly stipends to marginalized students preparing for highly competitive entrance examinations including JEE, NEET, and CLAT.",
    min_benefit_amount: 120000,
    max_benefit_amount: 120000,
    eligibility_json: { max_income: 800000, category: ["SC", "OBC"], education: ["Class 12", "Undergraduate"], states: ["All"] },
    required_documents: ["Caste Certificate", "Income Certificate", "Aadhaar Card", "Admit Card", "Bank Passbook"],
    prerequisites: ["Caste Certificate", "Income Certificate"],
    application_url: "https://www.buddy4study.com/article/post-matric-scholarships-for-sc-students",
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Competitive Exam Coaching",
    state: "All",
    ministry: "Ministry of Social Justice and Empowerment",
    provider_type: "Government",
    provider_name: "Ministry of Social Justice and Empowerment"
  },
  {
    title: "Financial Assistance for Wards of Beedi/Cine/IOMC/LSDM Workers",
    description: "Targeted welfare providing pre-matric and post-matric scholarships specifically to the children of laborers working in the Beedi, Cine, and Mica mining industries.",
    min_benefit_amount: 25000,
    max_benefit_amount: 25000,
    eligibility_json: { max_income: 100000, occupation: ["Beedi Worker", "Cine Worker", "IOMC Worker", "LSDM Worker"], education: ["Class 1 to 10", "Class 11 to 12", "Undergraduate"], states: ["All"] },
    required_documents: ["Worker Certificate", "Income Certificate", "Aadhaar Card", "College ID Card", "Bank Passbook"],
    prerequisites: ["Worker Certificate", "Income Certificate"],
    application_url: "https://www.buddy4study.com/article/scholarships-after-12th-in-india",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Occupational Welfare",
    state: "All",
    ministry: "Ministry of Labour and Employment",
    provider_type: "Government",
    provider_name: "Ministry of Labour and Employment"
  },
  {
    title: "SBIF Asha Scholarship Program for Overseas Education",
    description: "A high-value scholarship initiative designed to support meritorious students from SC and ST backgrounds to pursue postgraduate and master's degrees at premier global universities.",
    min_benefit_amount: 2000000,
    max_benefit_amount: 2000000,
    eligibility_json: { max_income: 600000, category: ["SC", "ST"], education: ["Postgraduate"], states: ["All"] },
    required_documents: ["Caste Certificate", "Admission Letter", "Aadhaar Card", "Income Certificate", "Passport"],
    prerequisites: ["Caste Certificate", "Admission Letter", "Passport"],
    application_url: "https://www.buddy4study.com/page/sbi-asha-scholarship-program",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Overseas Education",
    state: "All",
    ministry: "SBI Foundation CSR",
    provider_type: "Private Sector",
    provider_name: "SBI Foundation"
  },
  {
    title: "SBI Platinum Jubilee Asha Scholarship for IIM/IIT Students",
    description: "Massive financial support targeting students admitted to top-tier institutions including the Indian Institutes of Technology (IITs) and Indian Institutes of Management (IIMs).",
    min_benefit_amount: 1500000,
    max_benefit_amount: 1500000,
    eligibility_json: { max_income: 600000, education: ["Undergraduate", "Postgraduate"], states: ["All"] },
    required_documents: ["Admission Letter", "Aadhaar Card", "Income Certificate", "Marksheet", "College ID Card"],
    prerequisites: ["Admission Letter", "Income Certificate"],
    application_url: "https://www.buddy4study.com/page/sbi-asha-scholarship-program-for-overseas-education",
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Elite Domestic Education",
    state: "All",
    ministry: "SBI Foundation CSR",
    provider_type: "Private Sector",
    provider_name: "SBI Foundation"
  },
  {
    title: "HDFC Bank Parivartan's ECSS Programme (COVID Crisis)",
    description: "A rapid-intervention corporate scholarship intended to provide immediate financial relief to students facing extreme familial financial crises, including the loss of a primary earning member during the pandemic.",
    min_benefit_amount: 75000,
    max_benefit_amount: 75000,
    eligibility_json: { max_income: 600000, education: ["Class 1 to 12", "Undergraduate", "Postgraduate", "Diploma"], states: ["All"] },
    required_documents: ["Crisis Certificate", "Aadhaar Card", "Income Certificate", "Marksheet", "Bank Passbook"],
    prerequisites: ["Crisis Certificate", "Income Certificate"],
    application_url: "https://www.buddy4study.com/page/hdfc-bank-parivartans-covid-crisis-support-scholarship-program",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Crisis Intervention",
    state: "All",
    ministry: "HDFC Bank Corporate CSR",
    provider_type: "Private Sector",
    provider_name: "HDFC Bank"
  },
  {
    title: "Tata Capital Pankh Scholarship Program",
    description: "A tiered merit-cum-means scholarship subsidizing up to 80% of tuition fees for students across schooling, diploma, and professional undergraduate degree sectors.",
    min_benefit_amount: 100000,
    max_benefit_amount: 100000,
    eligibility_json: { max_income: 250000, education: ["Class 11", "Class 12", "Undergraduate", "Diploma", "ITI"], states: ["All"] },
    required_documents: ["Fee Receipt", "Income Certificate", "Aadhaar Card", "Marksheet", "Bank Passbook"],
    prerequisites: ["Income Certificate", "Marksheet"],
    application_url: "https://www.buddy4study.com/article/the-tata-capital-pankh-scholarship",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Merit-Cum-Means",
    state: "All",
    ministry: "Tata Capital Corporate CSR",
    provider_type: "Private Sector",
    provider_name: "Tata Capital Limited"
  },
  {
    title: "Amazon Future Engineer Scholarship",
    description: "Dedicated funding for young women pursuing degrees in computer science and allied branches, supplemented with laptops, career mentorship, and internship pathways.",
    min_benefit_amount: 50000,
    max_benefit_amount: 50000,
    eligibility_json: { max_income: 300000, gender: ["Female"], education: ["B.Tech", "B.E.", "Integrated M.Tech"], states: ["All"] },
    required_documents: ["College ID Card", "Aadhaar Card", "Income Certificate", "Marksheet", "Bank Passbook"],
    prerequisites: ["College ID Card", "Income Certificate"],
    application_url: "https://www.buddy4study.com/page/amazon-future-engineer-scholarship",
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Women in STEM",
    state: "All",
    ministry: "Amazon Corporate CSR",
    provider_type: "Private Sector",
    provider_name: "Amazon India"
  },
  {
    title: "Rolls-Royce Unnati Scholarship for Women Engineering Students",
    description: "Corporate CSR initiative designed to bolster female representation in engineering disciplines through sustained annual financial backing for undergraduate engineering students.",
    min_benefit_amount: 48000,
    max_benefit_amount: 48000,
    eligibility_json: { max_income: 400000, gender: ["Female"], education: ["B.Tech", "B.E."], states: ["All"] },
    required_documents: ["College ID Card", "Aadhaar Card", "Income Certificate", "Marksheet", "Bank Passbook"],
    prerequisites: ["College ID Card", "Income Certificate"],
    application_url: "https://www.buddy4study.com/article/rolls-royce-unnati-scholarships-for-women-engineering-students",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Women in STEM",
    state: "All",
    ministry: "Rolls-Royce CSR",
    provider_type: "Private Sector",
    provider_name: "Rolls-Royce India"
  },
  {
    title: "LIC Golden Jubilee Scholarship Scheme",
    description: "Supports economically weaker section (EWS) students with high academic merit to pursue diploma, vocational, and professional undergraduate courses after Class 12.",
    min_benefit_amount: 40000,
    max_benefit_amount: 40000,
    eligibility_json: { max_income: 250000, education: ["Class 12", "Undergraduate", "Diploma"], states: ["All"] },
    required_documents: ["Marksheet", "Income Certificate", "Aadhaar Card", "College ID Card", "Bank Passbook"],
    prerequisites: ["Marksheet", "Income Certificate"],
    application_url: "https://www.buddy4study.com/page/lic-golden-jubilee-scholarships",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: "General Higher Education",
    state: "All",
    ministry: "LIC Golden Jubilee Foundation",
    provider_type: "Private Sector",
    provider_name: "Life Insurance Corporation of India"
  },
  {
    title: "TATA AIA Paras Scholarship Program",
    description: "A highly specialized diversity inclusion program offering academic funding explicitly to transgender students and persons with disabilities enrolled in undergraduate curricula.",
    min_benefit_amount: 30000,
    max_benefit_amount: 30000,
    eligibility_json: { education: ["Undergraduate"], differently_abled_required: true, states: ["All"] },
    required_documents: ["Disability Certificate", "College ID Card", "Aadhaar Card", "Marksheet", "Bank Passbook"],
    prerequisites: ["Disability Certificate", "College ID Card"],
    application_url: "https://www.buddy4study.com/page/tata-aia-paras-scholarship-program",
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Diversity and Inclusion",
    state: "All",
    ministry: "TATA AIA Corporate CSR",
    provider_type: "Private Sector",
    provider_name: "TATA AIA Life Insurance Company Limited"
  },
  {
    title: "Foundation For Excellence Scholarship for Technical Courses",
    description: "A rigorous NGO-led program providing multi-year funding, technical skilling, and intensive mentorship to first-year engineering, medical, and law candidates from lower-income backgrounds.",
    min_benefit_amount: 50000,
    max_benefit_amount: 50000,
    eligibility_json: { max_income: 300000, education: ["B.Tech", "B.E.", "MBBS", "LLB"], states: ["All"] },
    required_documents: ["Admission Letter", "Income Certificate", "Aadhaar Card", "Marksheet", "Bank Passbook"],
    prerequisites: ["Admission Letter", "Income Certificate"],
    application_url: "https://www.buddy4study.com/page/foundation-for-excellence-scholarship-for-technical-courses",
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Technical Education",
    state: "All",
    ministry: "FFE NGO Network",
    provider_type: "NGO",
    provider_name: "Foundation For Excellence (FFE)"
  },
  {
    title: "Azim Premji Scholarship",
    description: "A sustained initiative by the Azim Premji Foundation focused primarily on supporting young women from underprivileged segments to complete their collegiate education with full fee coverage.",
    min_benefit_amount: 30000,
    max_benefit_amount: 30000,
    eligibility_json: { gender: ["Female"], education: ["Undergraduate"], states: ["All"] },
    required_documents: ["College ID Card", "Income Certificate", "Aadhaar Card", "Marksheet", "Bank Passbook"],
    prerequisites: ["College ID Card", "Income Certificate"],
    application_url: "https://www.buddy4study.com/page/azim-premji-scholarship",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Women's Education",
    state: "All",
    ministry: "Azim Premji Foundation",
    provider_type: "NGO",
    provider_name: "Azim Premji Foundation"
  },
  {
    title: "Lila Poonawalla Foundation Scholarships",
    description: "Empowers academically bright but financially constrained female students in the Pune, Amaravati, and Wardha regions to pursue undergraduate and postgraduate degrees without economic disruption.",
    min_benefit_amount: 50000,
    max_benefit_amount: 50000,
    eligibility_json: { gender: ["Female"], education: ["Undergraduate", "Postgraduate"], states: ["All"] },
    required_documents: ["Residency Certificate", "Income Certificate", "Aadhaar Card", "Marksheet", "Bank Passbook"],
    prerequisites: ["Residency Certificate", "Income Certificate"],
    application_url: "https://www.buddy4study.com/page/lila-poonawalla-foundation-scholarships",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Regional Women's Empowerment",
    state: "All",
    ministry: "Lila Poonawalla Trust",
    provider_type: "NGO",
    provider_name: "Lila Poonawalla Foundation"
  },
  {
    title: "K.C. Mahindra All India Talent Scholarship",
    description: "Provides essential financial grants to highly motivated students from lower-income backgrounds aiming to secure technical diplomas from recognized government polytechnics.",
    min_benefit_amount: 10000,
    max_benefit_amount: 10000,
    eligibility_json: { education: ["Diploma", "Polytechnic"], states: ["All"] },
    required_documents: ["Admission Letter", "Marksheet", "Aadhaar Card", "Income Certificate", "Bank Passbook"],
    prerequisites: ["Admission Letter"],
    application_url: "https://www.buddy4study.com/page/k.c.-mahindra-all-india-talent-scholarship",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Vocational and Diploma",
    state: "All",
    ministry: "K.C. Mahindra Education Trust",
    provider_type: "NGO",
    provider_name: "K.C. Mahindra Education Trust"
  },
  {
    id: "db859c25-f712-4022-9214-e25f6e80b2a6",
    title: "U-GO Scholarship Program 2026-27",
    description: "An initiative designed to provide financial assistance to talented young women pursuing professional undergraduate courses such as teaching, nursing, pharmacy, medicine, engineering, architecture, and law.",
    min_benefit_amount: 40000,
    max_benefit_amount: 60000,
    eligibility_json: {
      max_income: 500000,
      category: ["All"],
      states: ["All"],
      education: ["Undergraduate"],
      gender: ["Female"]
    },
    required_documents: [
      "Recent photograph",
      "Mark sheets and passing certificates of class 10 and 12",
      "Government-issued identity proof (Voter ID, Driving Licence, PAN card, etc.)",
      "Current year admission proof (fee receipt, admission letter, ID card, or bonafide certificate)",
      "Family income proof (ITR, Form 16, income certificate, or salary slips)",
      "Payment receipts for funds spent on academic purposes",
      "Bank account details"
    ],
    prerequisites: [
      "Must be a young woman enrolled in any year (except final year) of a professional graduation course",
      "Must have secured at least 70% marks in both Class 10 and Class 12 examinations"
    ],
    application_url: "https://www.buddy4study.com/page/ugo-scholarship-program",
    deadline: "2026-08-20T23:59:59.000Z",
    category: "Education",
    state: "All",
    ministry: "None",
    provider_type: "NGO",
    provider_name: "U-GO"
  },
  {
    title: "Unemployment Allowance Scheme",
    description: "The Department of Labour and Employment, Government of Himachal Pradesh introduced the Unemployment Allowance Scheme to provide allowance to eligible educated unemployed youth of Himachal Pradesh, so they can sustain themselves for a certain period.",
    min_benefit_amount: 12000,
    max_benefit_amount: 18000,
    eligibility_json: { max_income: 200000, states: ["Himachal Pradesh"], age: [20, 35], education: ["Undergraduate", "High School"] },
    required_documents: ["Employment Registration Card", "Income Certificate", "Bonafide Himachali Certificate", "Declaration Form C", "Bank Passbook", "Marksheet", "Aadhaar Card"],
    prerequisites: ["Employment Registration Card", "Income Certificate", "Bonafide Himachali Certificate", "Aadhaar Card"],
    application_url: "https://eemis.hp.nic.in/",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Unemployment Allowance",
    state: "Himachal Pradesh",
    ministry: "Labour and Employment",
    provider_type: "Government",
    provider_name: "Government of Himachal Pradesh"
  }
];

export async function seedDatabase() {
  console.log("Seeding Database...");

  let schemeError = null;
  try {
    // Clean old schemes and insert fresh ones
    await supabase.from("schemes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const schemesWithIds = mockSchemes.map((s, idx) => ({
      ...s,
      id: s.id || `00000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`
    }));
    const { error } = await supabase.from("schemes").insert(schemesWithIds);
    schemeError = error;
  } catch (err) {
    console.error("Error deleting/inserting schemes:", err);
    schemeError = err;
  }

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
  let familyError = null;
  if (user) {
    // Map family members to exclude claimed_benefits which doesn't exist in Supabase database public.family_members table
    const supabaseFamily = demoFamily.map(({ claimed_benefits, ...rest }, idx) => ({
      ...rest,
      id: `00000000-0000-0000-0000-${String(idx + 1).padStart(12, '1')}`
    }));
    const { error: fErr } = await supabase
      .from("family_members")
      .upsert(supabaseFamily, { onConflict: "id" });
    familyError = fErr;

    if (familyError) console.error("Error seeding family:", familyError);
    else console.log("Family seeded successfully");
  }

  return { success: !schemeError && !userError && !customUserError && !familyError };
}

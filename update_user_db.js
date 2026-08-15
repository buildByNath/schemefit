const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const userProfileData = {
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

const supabaseUserData = {
  full_name: "Nath.s",
  email: "nathshaj20006@gmail.com",
  annual_income: 250000,
  caste_category: "OBC",
  state: "Kerala",
  district: "palakkad",
  occupation: "Unemployed",
  education: "Btech",
  date_of_birth: "2001-01-17",
  gender: "Male",
  is_differently_abled: false,
  uploaded_documents: ["Aadhaar Card", "Bank Passbook", "Marksheet", "Employment Registration Card", "Income Certificate", "Bonafide Himachali Certificate", "Declaration Form C"]
};


async function run() {
  console.log("Updating User Profile in Supabase...");

  // Get user ID by email
  const { data: users, error: findError } = await supabase
    .from("users")
    .select("id")
    .eq("email", "nathshaj20006@gmail.com");

  if (findError) {
    console.error("Error finding user:", findError);
  } else if (users && users.length > 0) {
    const userId = users[0].id;
    const { data, error } = await supabase
      .from("users")
      .update(supabaseUserData)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Error updating user in Supabase:", error);
    } else {
      console.log("Supabase User Profile updated successfully:", data);
    }
  }

  // 2. Also update local mock_db.json
  try {
    const dbPath = path.join(__dirname, 'src', 'lib', 'mock_db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (db.users && db.users.length > 0) {
        db.users[0] = { ...db.users[0], ...userProfileData };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        console.log("Local mock_db.json updated successfully.");
      }
    }
  } catch (err) {
    console.error("Error updating local db:", err);
  }
}

run();

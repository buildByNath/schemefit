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

async function checkDb() {
  console.log("=== SUPABASE USER ===");
  const { data: users, error: findError } = await supabase
    .from("users")
    .select("*")
    .eq("email", "nathshaj20006@gmail.com");
    
  if (users && users.length > 0) {
     console.log(JSON.stringify(users[0], null, 2));
  } else {
     console.log("Error or no user:", findError);
  }
  
  console.log("\n=== MOCK DB USER ===");
  try {
    const dbPath = path.join(__dirname, 'src', 'lib', 'mock_db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (db.users && db.users.length > 0) {
        console.log(JSON.stringify(db.users[0], null, 2));
      }
    }
  } catch (e) {
    console.log("Error reading mock_db:", e);
  }
}
checkDb();

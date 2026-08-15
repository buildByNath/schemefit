import { supabase } from "./supabase";
import { demoUser, customUser, demoFamily, mockSchemes } from "./seed";
import path from "path";

// Define Types based on schema
export interface User {
  id: string;
  full_name: string;
  email: string;
  voice_raw_text?: string | null;
  annual_income?: number | null;
  caste_category?: string | null;
  state?: string | null;
  district?: string | null;
  occupation?: string | null;
  education?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  religion?: string | null;
  is_differently_abled?: boolean | null;
  bpl_status?: boolean | null;
  address?: string | null;
  phone?: string | null;
  aadhar?: string | null;
  bank_account?: string | null;
  ifsc_code?: string | null;
  bank_name?: string | null;
  exchange_reg?: string | null;
  uploaded_documents?: string[];
  role?: "student" | "ngo" | "private_sector" | null;
  organization_name?: string | null;
  registration_no?: string | null;
  official_email?: string | null;
  website_url?: string | null;
  google_drive_access_token?: string | null;
  google_drive_refresh_token?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Scheme {
  id: string;
  title: string;
  description?: string;
  min_benefit_amount?: number;
  max_benefit_amount?: number;
  eligibility_json?: any;
  required_documents?: string[];
  prerequisites?: string[];
  application_url?: string;
  deadline?: string;
  category?: string;
  state?: string;
  ministry?: string;
  status?: string;
  provider_type?: "Government" | "NGO" | "Private Sector" | null;
  provider_name?: string | null;
  created_by_user_id?: string | null;
  created_at?: string;
}

export interface Application {
  id: string;
  user_id: string;
  scheme_id: string;
  status: string;
  rejection_reason?: string | null;
  submitted_at?: string | null;
  updated_at?: string;
  scheme?: Scheme;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relation: string;
  age: number;
  occupation: string;
  annual_income: number;
  education?: string;
  claimed_benefits?: { scheme_title: string; amount: number; status: string }[];
}

export interface UserDocument {
  id: string;
  user_id: string;
  name: string;
  file_type: string;
  file_size: number;
  encrypted_data: string;
  iv: string;
  uploaded_at: string;
  document_category?: string;
}

export async function getActiveUserId(): Promise<string> {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      return user.id;
    }
  } catch (error) {
    // Fallback if not logged in or during build time
    console.error("Error getting active user id:", error);
  }
  
  // Fallback to a mock UUID if no one is logged in 
  // (useful for development without Supabase connected)
  return "00000000-0000-0000-0000-000000000001";
}

// Check if we should use Supabase or fallback to JSON file
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && !url.includes("placeholder") && key && !key.includes("placeholder");
};

// Local JSON file database helper
const getLocalDbPath = () => {
  return path.join(process.cwd(), "src/lib/mock_db.json");
};

const readLocalDb = (): {
  users: User[];
  schemes: Scheme[];
  applications: Application[];
  family_members: FamilyMember[];
  documents: UserDocument[];
} => {
  if (typeof window !== "undefined") {
    return { users: [], schemes: [], applications: [], family_members: [], documents: [] };
  }
  
  const fs = require("fs");
  const dbPath = getLocalDbPath();
  
  if (!fs.existsSync(dbPath)) {
    // Initialize mock database with seed data
    const initialDb = {
      users: [
        {
          ...demoUser,
          voice_raw_text: "I am an OBC student with 2.5 lakh income, studying undergraduate course in Kerala."
        },
        {
          ...customUser
        }
      ],
      schemes: mockSchemes.map((s, idx) => ({
        ...s,
        id: `scheme-0000-0000-0000-00000000000${idx + 1}`
      })),
      applications: [] as Application[],
      family_members: demoFamily.map((f, idx) => ({
        ...f,
        id: `family-member-0000-0000-0000-00000000000${idx + 1}`
      })),
      documents: [] as UserDocument[]
    };

    // Pre-populate some applications for Rahul Menon to showcase rejection analyzer
    const studentAccessScheme = initialDb.schemes.find(s => s.title.includes("Digital Access"));
    const keralaGrantScheme = initialDb.schemes.find(s => s.title.includes("Higher Education"));
    const postMatricScheme = initialDb.schemes.find(s => s.title.includes("Post-Matric"));
    
    if (studentAccessScheme) {
      initialDb.applications.push({
        id: "app-0000-0000-0000-000000000001",
        user_id: demoUser.id,
        scheme_id: studentAccessScheme.id,
        status: "Rejected",
        rejection_reason: "Income certificate copy was blurry and could not be verified by the block development officer.",
        submitted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    if (keralaGrantScheme) {
      initialDb.applications.push({
        id: "app-0000-0000-0000-000000000002",
        user_id: demoUser.id,
        scheme_id: keralaGrantScheme.id,
        status: "Delayed",
        rejection_reason: "Processing delayed by Higher Education Department for more than 45 days without response.",
        submitted_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    if (postMatricScheme) {
      initialDb.applications.push({
        id: "app-0000-0000-0000-000000000003",
        user_id: demoUser.id,
        scheme_id: postMatricScheme.id,
        status: "Approved",
        rejection_reason: null,
        submitted_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Seed mock documents for Rahul Menon
    initialDb.documents.push({
      id: "doc-0000-0000-0000-000000000001",
      user_id: demoUser.id,
      name: "Aadhaar_Card_Rahul.pdf",
      file_type: "application/pdf",
      file_size: 45600,
      encrypted_data: "U0FUVVJOWF9FTkNSWVBURURfQUFESEFBUl9DQVJEX0NBTExPVVRfVEVYVF9GSUxFX0RBVEE=",
      iv: "c2F0dXJueF9pdg==",
      uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    });

    initialDb.documents.push({
      id: "doc-0000-0000-0000-000000000002",
      user_id: demoUser.id,
      name: "Income_Certificate_Rahul.pdf",
      file_type: "application/pdf",
      file_size: 32400,
      encrypted_data: "U0FUVVJOWF9FTkNSWVBURURfSU5DT01FX0NFUlRJRklDQVRFX0NBTExPVVRfVEVYVF9GSUxFX0RBVEE=",
      iv: "c2F0dXJueF9pdg==",
      uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    });

    fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb as any;
  }

  try {
    const content = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading local db file, returning empty state:", error);
    return { users: [], schemes: [], applications: [], family_members: [], documents: [] };
  }
};

const writeLocalDb = (data: any) => {
  if (typeof window !== "undefined") return;
  const fs = require("fs");
  const dbPath = getLocalDbPath();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
};

// Database Layer Operations
export async function getUser(id?: string): Promise<User | null> {
  const userId = id || await getActiveUserId();
  
  if (isSupabaseConfigured()) {
    try {
      // Always use the auth-aware server client so the session cookie is sent
      const { createClient: createServerClient } = await import('@/utils/supabase/server');
      const authSupabase = await createServerClient();

      const { data, error } = await authSupabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
        
      if (error) throw error;
      
      // Auto-create user in public.users if they exist in auth but not public yet
      if (!data) {
         const { data: authData } = await authSupabase.auth.getUser();
         if (authData?.user && authData.user.id === userId) {
            const { data: newUser, error: insertError } = await authSupabase
              .from("users")
              .insert({
                id: userId,
                email: authData.user.email,
                full_name: authData.user.user_metadata?.full_name || "New User"
              })
              .select()
              .single();
            if (insertError) console.error("Auto-create user error:", insertError);
            return newUser;
         }
      }
      
      return data;
    } catch (err) {
      console.error("Supabase getUser error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  return db.users.find(u => u.id === userId) || null;
}

export async function updateUser(id?: string, updates?: Partial<User>): Promise<User> {
  const userId = id || await getActiveUserId();
  const userUpdates = updates || {};
  
  if (isSupabaseConfigured()) {
    try {
      const { createClient: createServerClient } = await import('@/utils/supabase/server');
      const authSupabase = await createServerClient();

      // Get auth user details so we can fill required fields for upsert
      const { data: authData } = await authSupabase.auth.getUser();

      // Use UPSERT so this works even if the public.users row doesn't exist yet
      const { data, error } = await authSupabase
        .from("users")
        .upsert({
          id: userId,
          email: authData?.user?.email || userUpdates.email || "",
          full_name: userUpdates.full_name || authData?.user?.user_metadata?.full_name || "New User",
          annual_income: userUpdates.annual_income,
          caste_category: userUpdates.caste_category,
          state: userUpdates.state,
          district: userUpdates.district,
          occupation: userUpdates.occupation,
          education: userUpdates.education,
          voice_raw_text: userUpdates.voice_raw_text,
          date_of_birth: userUpdates.date_of_birth,
          gender: userUpdates.gender,
          marital_status: userUpdates.marital_status,
          religion: userUpdates.religion,
          is_differently_abled: userUpdates.is_differently_abled,
          bpl_status: userUpdates.bpl_status,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase updateUser error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  const index = db.users.findIndex(u => u.id === userId);
  const now = new Date().toISOString();
  
  if (index !== -1) {
    db.users[index] = {
      ...db.users[index],
      ...userUpdates,
      updated_at: now
    };
  } else {
    // Create new if not found
    const newUser: User = {
      id: userId,
      full_name: userUpdates.full_name || "New User",
      email: userUpdates.email || "new@user.com",
      created_at: now,
      updated_at: now,
      ...userUpdates
    };
    db.users.push(newUser);
  }
  
  writeLocalDb(db);
  return (index !== -1 ? db.users[index] : db.users[db.users.length - 1]) as User;
}

export async function getSchemes(): Promise<Scheme[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("schemes")
        .select("*");
      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (err) {
      console.error("Supabase getSchemes error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  return db.schemes;
}

export async function getSchemeById(id: string): Promise<Scheme | null> {
  const schemes = await getSchemes();
  return schemes.find(s => s.id === id) || null;
}

export async function getApplications(userId?: string): Promise<Application[]> {
  const uid = userId || await getActiveUserId();
  
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          scheme:schemes(*)
        `)
        .eq("user_id", uid);
      if (error) throw error;
      if (data) return data as any;
    } catch (err) {
      console.error("Supabase getApplications error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  const userApps = db.applications.filter(a => a.user_id === uid);
  
  // Join scheme data manually
  return userApps.map(app => ({
    ...app,
    scheme: db.schemes.find(s => s.id === app.scheme_id)
  }));
}

export async function createApplication(
  userId?: string,
  schemeId?: string,
  status: string = "Pending",
  rejectionReason: string | null = null
): Promise<Application> {
  const uid = userId || await getActiveUserId();
  if (!schemeId) throw new Error("schemeId is required");
  const now = new Date().toISOString();
  
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .insert({
          user_id: uid,
          scheme_id: schemeId,
          status,
          rejection_reason: rejectionReason,
          submitted_at: now
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase createApplication error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  const newApp: Application = {
    id: `app-${Math.random().toString(36).substr(2, 9)}`,
    user_id: uid,
    scheme_id: schemeId,
    status,
    rejection_reason: rejectionReason,
    submitted_at: now,
    updated_at: now
  };
  
  db.applications.push(newApp);
  writeLocalDb(db);
  
  // Attach scheme details for returned value
  newApp.scheme = db.schemes.find(s => s.id === schemeId);
  return newApp;
}

export async function getFamilyMembers(userId?: string): Promise<FamilyMember[]> {
  const uid = userId || await getActiveUserId();
  
  // Claimed benefits lookup — enriches members with welfare payout records
  // This is stored locally because the Supabase family_members table doesn't have a claimed_benefits column
  const claimedBenefitsLookup: Record<string, { scheme_title: string; amount: number; status: string }[]> = {
    "Suresh Menon": [
      { scheme_title: "PM Kisan Samman Nidhi (PM-KISAN)", amount: 6000, status: "Approved" }
    ],
    "Geetha Menon": [
      { scheme_title: "Women Entrepreneurship Assistance", amount: 50000, status: "Approved" }
    ],
    "Anjali": [
      { scheme_title: "Kerala Women Self-Employment Assistance", amount: 25000, status: "Approved" },
      { scheme_title: "National Family Benefit Scheme (NFBS)", amount: 10000, status: "Approved" }
    ]
  };

  const enrichMembers = (members: FamilyMember[]): FamilyMember[] => {
    return members.map(m => ({
      ...m,
      claimed_benefits: m.claimed_benefits || claimedBenefitsLookup[m.name] || []
    }));
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", uid);
      if (error) throw error;
      return enrichMembers(data || []);
    } catch (err) {
      console.error("Supabase getFamilyMembers error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  return enrichMembers(db.family_members.filter(f => f.user_id === uid));
}

export async function addFamilyMember(member: Omit<FamilyMember, "id" | "user_id">): Promise<FamilyMember> {
  const uid = await getActiveUserId();
  const newMember: FamilyMember = {
    id: `family-${Math.random().toString(36).substr(2, 9)}`,
    user_id: uid,
    ...member
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("family_members")
        .insert({ user_id: uid, ...member })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase addFamilyMember error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  db.family_members.push(newMember);
  writeLocalDb(db);
  return newMember;
}

export async function getUserDocuments(userId?: string): Promise<UserDocument[]> {
  const uid = userId || await getActiveUserId();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", uid);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Supabase getUserDocuments error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  return db.documents.filter(d => d.user_id === uid);
}

export async function addUserDocument(doc: Omit<UserDocument, "id" | "user_id" | "uploaded_at">): Promise<UserDocument> {
  const uid = await getActiveUserId();
  const newDoc: UserDocument = {
    id: `doc-${Math.random().toString(36).substr(2, 9)}`,
    user_id: uid,
    uploaded_at: new Date().toISOString(),
    document_category: doc.document_category || "Other",
    ...doc
  };

  if (isSupabaseConfigured()) {
    try {
      const { id, ...docToInsert } = newDoc;
      const { data, error } = await supabase
        .from("documents")
        .insert(docToInsert)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase addUserDocument error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  db.documents.push(newDoc);
  writeLocalDb(db);
  return newDoc;
}

export async function deleteUserDocument(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deleteUserDocument error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  const initialLength = db.documents.length;
  db.documents = db.documents.filter(d => d.id !== id);
  writeLocalDb(db);
  return db.documents.length < initialLength;
}

export async function seedMockData() {
  if (isSupabaseConfigured()) {
    try {
      const { seedDatabase } = require("./seed");
      return await seedDatabase();
    } catch (err) {
      console.error("Supabase seeding error:", err);
    }
  }
  
  // Local seeding is handled automatically during readLocalDb() if the file doesn't exist,
  // but let's force write/reset here if needed
  const fs = require("fs");
  const dbPath = getLocalDbPath();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath); // Delete it and let it recreate fresh
  }
  readLocalDb();
  return { success: true };
}

export async function createScheme(schemeData: Omit<Scheme, "id" | "created_at">): Promise<Scheme> {
  const uid = await getActiveUserId();
  const now = new Date().toISOString();
  const newScheme: Scheme = {
    id: `scheme-${Math.random().toString(36).substr(2, 9)}`,
    created_at: now,
    created_by_user_id: uid,
    provider_type: schemeData.provider_type || "NGO",
    provider_name: schemeData.provider_name || schemeData.ministry || "Private / NGO Organization",
    ...schemeData
  };

  if (isSupabaseConfigured()) {
    try {
      const { id, ...schemeToInsert } = newScheme;
      const { data, error } = await supabase
        .from("schemes")
        .insert(schemeToInsert)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Supabase createScheme error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  db.schemes.unshift(newScheme);
  writeLocalDb(db);
  return newScheme;
}

export async function getProviderSchemes(providerUserId?: string): Promise<Scheme[]> {
  const uid = providerUserId || await getActiveUserId();
  const allSchemes = await getSchemes();
  return allSchemes.filter(s => s.created_by_user_id === uid || (s.provider_type && s.provider_type !== "Government"));
}

export async function getProviderApplications(providerUserId?: string): Promise<{ application: Application; student: User | null; scheme: Scheme | null }[]> {
  const uid = providerUserId || await getActiveUserId();
  const db = readLocalDb();
  
  // Get schemes belonging to this provider or all non-government schemes for demo
  const providerSchemes = db.schemes.filter(s => s.created_by_user_id === uid || (s.provider_type && s.provider_type !== "Government"));
  const providerSchemeIds = new Set(providerSchemes.map(s => s.id));

  const apps = db.applications.filter(a => providerSchemeIds.has(a.scheme_id));
  return apps.map(app => {
    const student = db.users.find(u => u.id === app.user_id) || null;
    const scheme = db.schemes.find(s => s.id === app.scheme_id) || null;
    return { application: app, student, scheme };
  });
}

export async function updateApplicationStatus(applicationId: string, status: string, rejectionReason?: string): Promise<boolean> {
  const db = readLocalDb();
  const appIndex = db.applications.findIndex(a => a.id === applicationId);
  if (appIndex !== -1) {
    db.applications[appIndex].status = status;
    if (rejectionReason !== undefined) {
      db.applications[appIndex].rejection_reason = rejectionReason;
    }
    db.applications[appIndex].updated_at = new Date().toISOString();
    writeLocalDb(db);
    return true;
  }
  return false;
}


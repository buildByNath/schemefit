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
  uploaded_documents?: string[];
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
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
        
      if (error) throw error;
      
      // Auto-create user in public.users if they exist in auth but not public yet
      if (!data) {
         const { data: authData } = await supabase.auth.getUser();
         if (authData?.user && authData.user.id === userId) {
            const { data: newUser } = await supabase
              .from("users")
              .insert({
                id: userId,
                email: authData.user.email,
                full_name: authData.user.user_metadata?.full_name || "Unknown User"
              })
              .select()
              .single();
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
      const { data, error } = await supabase
        .from("users")
        .update(userUpdates)
        .eq("id", userId)
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
  
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", uid);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Supabase getFamilyMembers error, falling back to local:", err);
    }
  }

  // Local fallback
  const db = readLocalDb();
  return db.family_members.filter(f => f.user_id === uid);
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
        .insert(newMember)
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
        .from("user_documents")
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
    ...doc
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("user_documents")
        .insert(newDoc)
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
        .from("user_documents")
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

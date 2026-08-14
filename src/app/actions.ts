"use server";

import { updateUser, createApplication, seedMockData, getActiveUserId, addFamilyMember, addUserDocument, deleteUserDocument, getSchemes, createScheme, getProviderSchemes, getProviderApplications, updateApplicationStatus, getUser } from "@/lib/db";

export async function getCurrentUserAction() {
  try {
    const user = await getUser();
    return { success: true, user };
  } catch (error) {
    return { success: false, error: String(error), user: null };
  }
}
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function saveUserProfile(data: {
  full_name: string;
  voice_raw_text: string;
  annual_income: number;
  caste_category: string;
  education: string;
  occupation: string;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  religion?: string | null;
  is_differently_abled?: boolean | null;
  bpl_status?: boolean | null;
  state?: string | null;
}) {
  try {
    const userId = await getActiveUserId();
    await updateUser(userId, {
      full_name: data.full_name,
      voice_raw_text: data.voice_raw_text,
      annual_income: data.annual_income,
      caste_category: data.caste_category,
      education: data.education,
      occupation: data.occupation,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      marital_status: data.marital_status,
      religion: data.religion,
      is_differently_abled: data.is_differently_abled,
      bpl_status: data.bpl_status,
      state: data.state || "Kerala"
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    console.error("Error in saveUserProfile action:", error);
    return { success: false, error: String(error) };
  }
}

export async function applyToScheme(schemeId: string) {
  try {
    const userId = await getActiveUserId();
    await createApplication(userId, schemeId, "Pending", null);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    console.error("Error in applyToScheme action:", error);
    return { success: false, error: String(error) };
  }
}

export async function resetDatabaseAction() {
  try {
    await seedMockData();
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    console.error("Error in resetDatabaseAction:", error);
    return { success: false, error: String(error) };
  }
}


export async function addFamilyMemberAction(data: {
  name: string;
  relation: string;
  age: number;
  occupation: string;
  annual_income: number;
}) {
  try {
    await addFamilyMember(data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/family");
    return { success: true };
  } catch (error) {
    console.error("Error in addFamilyMemberAction:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateUserDocumentsAction(documents: string[]) {
  try {
    const userId = await getActiveUserId();
    await updateUser(userId, { uploaded_documents: documents });
    revalidatePath("/dashboard/benefits");
    return { success: true };
  } catch (error) {
    console.error("Error in updateUserDocumentsAction:", error);
    return { success: false, error: String(error) };
  }
}

export async function saveEncryptedDocumentAction(data: {
  name: string;
  file_type: string;
  file_size: number;
  encrypted_data: string;
  iv: string;
}) {
  try {
    const doc = await addUserDocument(data);
    revalidatePath("/dashboard/documents");
    return { success: true, doc };
  } catch (error) {
    console.error("Error in saveEncryptedDocumentAction:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteUserDocumentAction(id: string) {
  try {
    await deleteUserDocument(id);
    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteUserDocumentAction:", error);
    return { success: false, error: String(error) };
  }
}

export async function getAllSchemesAction() {
  try {
    const schemes = await getSchemes();
    return { success: true, schemes };
  } catch (error) {
    console.error("Error in getAllSchemesAction:", error);
    return { success: false, error: String(error), schemes: [] };
  }
}

export async function createProviderSchemeAction(data: {
  title: string;
  description: string;
  min_benefit_amount: number;
  max_benefit_amount: number;
  category: string;
  provider_type: "NGO" | "Private Sector";
  provider_name: string;
  application_url?: string;
  deadline?: string;
  required_documents?: string[];
}) {
  try {
    const scheme = await createScheme({
      ...data,
      state: "All",
      ministry: data.provider_name,
      status: "Active",
      eligibility_json: { max_income: 500000, states: ["All"] }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/provider");
    return { success: true, scheme };
  } catch (error) {
    console.error("Error in createProviderSchemeAction:", error);
    return { success: false, error: String(error) };
  }
}

export async function getProviderSchemesAction() {
  try {
    const schemes = await getProviderSchemes();
    return { success: true, schemes };
  } catch (error) {
    console.error("Error in getProviderSchemesAction:", error);
    return { success: false, error: String(error), schemes: [] };
  }
}

export async function getProviderApplicationsAction() {
  try {
    const data = await getProviderApplications();
    return { success: true, applications: data };
  } catch (error) {
    console.error("Error in getProviderApplicationsAction:", error);
    return { success: false, error: String(error), applications: [] };
  }
}

export async function updateApplicationStatusAction(applicationId: string, status: string, rejectionReason?: string) {
  try {
    await updateApplicationStatus(applicationId, status, rejectionReason);
    revalidatePath("/dashboard/provider");
    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    console.error("Error in updateApplicationStatusAction:", error);
    return { success: false, error: String(error) };
  }
}


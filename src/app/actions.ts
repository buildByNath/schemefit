"use server";

import { updateUser, createApplication, seedMockData, getActiveUserId, addFamilyMember, addUserDocument, deleteUserDocument } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function saveUserProfile(data: {
  full_name: string;
  voice_raw_text: string;
  annual_income: number;
  caste_category: string;
  education: string;
  occupation: string;
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
      state: "Kerala" // Set default state for demo matches
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

export async function toggleUserModeAction() {
  try {
    const cookieStore = await cookies();
    const currentMode = cookieStore.get("user_mode")?.value || "demo";
    const newMode = currentMode === "demo" ? "user" : "demo";
    cookieStore.set("user_mode", newMode, { path: "/" });
    
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    return { success: true, mode: newMode };
  } catch (error) {
    console.error("Error in toggleUserModeAction:", error);
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

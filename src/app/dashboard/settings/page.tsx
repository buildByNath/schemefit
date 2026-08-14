import { getUser, getActiveUserId } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const userId = await getActiveUserId();
  const user = await getUser(userId);

  if (!user) {
    redirect("/");
  }

  return (
    <div className="p-4 md:p-8">
      <SettingsForm initialUser={user} />
    </div>
  );
}

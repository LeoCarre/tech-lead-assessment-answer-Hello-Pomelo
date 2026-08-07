import { redirect } from "next/navigation";

/** Ancienne stub : la landing Q3 est désormais `/portal`. */
export default function ArchitectureRedirectPage() {
  redirect("/portal");
}

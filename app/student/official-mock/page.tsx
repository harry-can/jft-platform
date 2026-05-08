import { redirect } from "next/navigation";

export default function OfficialMockRedirectPage() {
  redirect("/student/official-mock/list");
}
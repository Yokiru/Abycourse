import { redirect } from "next/navigation";

export default function ProtectedAdminIndexPage() {
  redirect("/admin/exams");
}

import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpenText, FilePenLine, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { Button } from "./ui";

export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell min-h-screen bg-[var(--color-bg)]">
      <header className="admin-shell-header border-b border-[var(--color-border)] bg-white/92 backdrop-blur">
        <div className="app-shell flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <Link href="/admin/exams" className="text-2xl font-semibold text-[var(--color-text)]">
              Aby Course
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Ruang kerja ujian online untuk {userName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/admin/exams" variant="ghost" className="gap-2 px-4">
              <BookOpenText className="h-4 w-4" />
              Exams
            </Button>
            <Button href="/admin/exams/new" variant="secondary" className="gap-2 px-4">
              <FilePenLine className="h-4 w-4" />
              New Exam
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" className="gap-2 px-4">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="admin-shell-main section-space">
        <div className="admin-shell-content app-shell flex flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}

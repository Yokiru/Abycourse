import { redirect } from "next/navigation";
import { FilePenLine, ShieldCheck, Sparkles, SquareArrowOutUpRight } from "lucide-react";
import { loginAction } from "@/app/actions";
import { Button, Card, Input, PageIntro } from "@/components/ui";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin/exams");
  }

  await searchParams;

  return (
    <main className="flex-1">
      <section className="section-space">
        <div className="app-shell grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center gap-6">
            <PageIntro
              eyebrow="Akses Guru"
              title="Masuk ke workspace guru yang siap dipakai setiap hari."
              description="Dari sini kamu bisa menyusun exam, generate draft AI, membagikan link murid, dan meninjau submission dalam alur kerja yang lebih rapi."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: FilePenLine,
                  title: "Draft & editor",
                  description: "Satu tempat untuk manual builder, AI draft, dan revisi soal.",
                },
                {
                  icon: SquareArrowOutUpRight,
                  title: "Share link",
                  description: "Bagikan link publik yang ringan untuk murid tanpa login.",
                },
                {
                  icon: Sparkles,
                  title: "Review hasil",
                  description: "Submission, score MCQ, dan print PDF tetap dekat dengan draft exam.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <section key={title} className="surface-card flex min-h-48 flex-col gap-4 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-surface)]">
                    <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
                    <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                      {description}
                    </p>
                  </div>
                </section>
              ))}
            </div>
          </div>
          <Card className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Masuk Admin</h2>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  Masuk dengan akun guru yang kamu gunakan untuk mengelola exam.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-surface)]">
                <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Halaman ini dipakai khusus untuk guru. Sesudah masuk, semua draft, link exam, submission, dan file print dikelola dari dashboard yang sama.
            </div>
            <form action={loginAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  Email admin
                </p>
                <Input name="email" type="email" placeholder="teacher@abycourse.com" required />
              </div>
              <div className="space-y-2">
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">Password</p>
                <Input name="password" type="password" placeholder="Password" required />
              </div>
              <Button type="submit">Masuk ke Dashboard</Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}

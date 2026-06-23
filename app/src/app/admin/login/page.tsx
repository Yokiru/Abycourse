import { redirect } from "next/navigation";
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
        <div className="app-shell grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6">
            <PageIntro
              eyebrow="Teacher admin"
              title="Masuk ke workspace ujianmu."
              description="Ruang admin ini dipakai untuk bikin draft exam, share link ke murid, dan membaca semua submission tanpa alur yang ribet."
            />
          </div>
          <Card className="flex flex-col gap-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Admin Login</h2>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                Masuk pakai akun guru lokal yang sudah diseed otomatis.
              </p>
            </div>
            <form action={loginAction} className="flex flex-col gap-4">
              <Input name="email" type="email" placeholder="teacher@abycourse.local" required />
              <Input name="password" type="password" placeholder="Password" required />
              <Button type="submit">Masuk ke Dashboard</Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}

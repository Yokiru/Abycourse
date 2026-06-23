import { ArrowRight } from "lucide-react";
import { loginAction } from "@/app/actions";
import { Button, Card, Input } from "@/components/ui";
import { getCurrentAdmin } from "@/lib/auth";
import { env } from "@/lib/env";

export default async function HomePage() {
  const admin = await getCurrentAdmin();

  return (
    <main className="flex-1">
      <section className="section-space">
        <div className="app-shell">
          <div className="flex min-h-[70vh] items-center justify-center">
            <Card className="w-full max-w-[460px] p-6 md:p-8">
              {admin ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Sudah masuk
                    </p>
                    <h2 className="text-3xl font-semibold text-[var(--color-text)]">
                      Selamat datang kembali, {admin.name}.
                    </h2>
                    <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                      Session kamu masih aktif. Lanjut saja ke dashboard untuk membuka draft, exam aktif, atau submission terbaru.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button href="/admin/exams" className="gap-2">
                      Buka Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button href="/admin/exams/new" variant="secondary">
                      Buat Exam Baru
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Login Admin
                    </p>
                    <h2 className="text-3xl font-semibold text-[var(--color-text)]">
                      Masuk untuk mulai bekerja.
                    </h2>
                    <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                      Halaman ini khusus untuk guru. Link exam murid dibagikan nanti dari dalam dashboard.
                    </p>
                  </div>

                  <form action={loginAction} className="space-y-4">
                    <input type="hidden" name="successRedirect" value="/admin/exams" />
                    <input type="hidden" name="failureRedirect" value="/" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Email
                      </p>
                      <Input
                        name="email"
                        type="email"
                        placeholder={env.adminEmail.includes("@") ? env.adminEmail : "Email admin"}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Password
                      </p>
                      <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Masuk ke Dashboard
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

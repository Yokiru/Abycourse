import Link from "next/link";
import { Button, Card, PageIntro } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <main className="flex-1">
      <section className="section-space">
        <div className="app-shell max-w-3xl">
          <Card className="space-y-6">
            <PageIntro
              eyebrow="Halaman tidak tersedia"
              title="Halaman yang kamu cari tidak ketemu."
              description="Kalau ini link exam, kemungkinan exam-nya belum dipublish, sudah ditutup, atau URL-nya memang salah."
            />
            <div className="flex flex-wrap gap-3">
              <Button href="/">Kembali ke awal</Button>
              <Button href="/admin/login" variant="secondary">
                Masuk Admin
              </Button>
            </div>
            <Link href="/" className="text-sm font-semibold text-[var(--color-primary)]">
              Balik ke halaman awal
            </Link>
          </Card>
        </div>
      </section>
    </main>
  );
}

import { notFound } from "next/navigation";
import { startExamAttemptAction } from "@/app/actions";
import { Button, Card, Input, PageIntro } from "@/components/ui";
import { getExamBySlug } from "@/lib/db/queries";

export default async function PublicExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);

  if (!exam) {
    notFound();
  }

  await searchParams;

  if (exam.status === "closed") {
    return (
      <main className="flex-1">
        <section className="section-space">
          <div className="app-shell">
            <Card className="space-y-4">
              <h1 className="text-3xl font-semibold">Exam ini sudah ditutup.</h1>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                Minta guru mengirim link exam yang masih aktif kalau kamu memang perlu mengerjakan ulang.
              </p>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  if (exam.status !== "published") {
    return (
      <main className="flex-1">
        <section className="section-space">
          <div className="app-shell">
            <Card className="space-y-4">
              <h1 className="text-3xl font-semibold">Exam belum tersedia.</h1>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                Link ini belum dipublish oleh guru.
              </p>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="section-space">
        <div className="app-shell max-w-3xl space-y-6">
          <PageIntro
            eyebrow="Online exam"
            title={exam.title}
            description={exam.instructions || "Read carefully and answer all questions."}
          />
          <Card className="space-y-5">
            <h2 className="text-2xl font-semibold">Sebelum mulai</h2>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              Masukkan nama dulu, lalu kamu akan langsung masuk ke halaman soal.
            </p>
            <form action={startExamAttemptAction} className="space-y-4">
              <input type="hidden" name="examSlug" value={slug} />
              <Input name="studentName" placeholder="Nama lengkap" required />
              <Button type="submit">Mulai Exam</Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}

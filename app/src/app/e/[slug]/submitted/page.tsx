import { Card, PageIntro } from "@/components/ui";
import { firstParam } from "@/lib/utils";

export default async function SubmittedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const studentName = firstParam(params.name) ?? "Student";

  return (
    <main className="flex-1">
      <section className="section-space">
        <div className="app-shell max-w-3xl">
          <Card className="space-y-5">
            <PageIntro
              eyebrow="Submitted"
              title={`Thanks, ${studentName}.`}
              description="Jawabanmu sudah terkirim. Kamu bisa tutup halaman ini sekarang."
            />
          </Card>
        </div>
      </section>
    </main>
  );
}

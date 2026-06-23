import { notFound, redirect } from "next/navigation";
import { StudentAttemptForm } from "@/components/student-attempt-form";
import { PageIntro } from "@/components/ui";
import { getAttemptBundle } from "@/lib/db/queries";

export default async function AttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; attemptToken: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, attemptToken } = await params;
  const bundle = await getAttemptBundle({ examSlug: slug, attemptToken });

  if (!bundle) {
    notFound();
  }

  if (bundle.attempt.status === "submitted") {
    redirect(`/e/${slug}/submitted?name=${encodeURIComponent(bundle.attempt.studentName)}`);
  }

  await searchParams;

  return (
    <main className="flex-1">
      <section className="section-space">
        <div className="app-shell max-w-3xl space-y-6">
          <PageIntro
            eyebrow={`Exam for ${bundle.attempt.studentName}`}
            title={bundle.exam.title}
            description={bundle.exam.instructions || "Answer all questions carefully."}
          />
          <StudentAttemptForm
            examSlug={slug}
            attemptToken={attemptToken}
            questions={bundle.questions}
          />
        </div>
      </section>
    </main>
  );
}

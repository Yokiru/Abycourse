import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExamPrintDocument } from "@/components/exam-print-document";
import { PrintExamActions } from "@/components/print-exam-actions";
import { getExamBundle } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ examId: string }>;
}): Promise<Metadata> {
  const { examId } = await params;
  const bundle = await getExamBundle(examId);

  if (!bundle) {
    return {
      title: "Answer Key Print",
    };
  }

  return {
    title: `${bundle.exam.title} - Kunci Jawaban`,
  };
}

export default async function PrintAnswerKeyPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const bundle = await getExamBundle(examId);

  if (!bundle) {
    notFound();
  }

  return (
    <main className="print-page-root min-h-screen bg-[#f8f8fb] print:bg-white">
      <PrintExamActions
        backHref={`/admin/exams/${bundle.exam.publicId}`}
        secondaryHref={`/admin/exams/${bundle.exam.publicId}/print`}
        secondaryLabel="Lembar Murid"
      />

      <section className="mx-auto w-full max-w-4xl px-4 py-5 md:px-6 md:py-6 print:max-w-none print:px-0 print:py-0">
        <ExamPrintDocument exam={bundle.exam} questions={bundle.questions} mode="answers" />
      </section>
    </main>
  );
}

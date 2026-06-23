import type { ExamRecord, QuestionRecord } from "@/lib/types";
import { formatDateTime, getDifficultyDescription } from "@/lib/utils";

export function ExamPrintDocument({
  exam,
  questions,
  mode,
}: {
  exam: ExamRecord;
  questions: QuestionRecord[];
  mode: "student" | "answers";
}) {
  return (
    <article className="print-exam-sheet mx-auto max-w-[794px] bg-white p-6 md:p-8 print:max-w-none print:p-0">
      <header className="border-b border-black pb-4">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
              {mode === "answers" ? "Answer Key" : "English Exam"}
            </p>
            <h1 className="mt-2 text-[30px] font-semibold leading-tight text-black print:text-[22px]">
              {exam.title}
            </h1>
          </div>
          {mode === "student" ? (
            <div className="w-52 shrink-0 text-sm text-black">
              <p className="font-semibold">Name:</p>
              <div className="mt-5 border-b border-black" />
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 text-[13px] leading-6 text-black">
          {exam.instructions ? (
            <p>
              <span className="font-semibold">Instructions:</span>{" "}
              {exam.instructions}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {exam.difficultyLevel ? (
              <p>
                <span className="font-semibold">Level:</span>{" "}
                {exam.difficultyLevel} - {getDifficultyDescription(exam.difficultyLevel)}
              </p>
            ) : null}
            <p>
              <span className="font-semibold">Questions:</span> {questions.length}
            </p>
            <p>
              <span className="font-semibold">Updated:</span>{" "}
              {formatDateTime(exam.updatedAt)}
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-5 pt-5 text-black print:space-y-4 print:pt-4">
        {questions.map((question, index) => (
          <div key={question.publicId} className="break-inside-avoid space-y-2.5">
            <div className="flex items-start gap-3 text-[15px] leading-7 print:text-[14px] print:leading-6">
              <span className="shrink-0 font-semibold">{index + 1}.</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-medium text-black">{question.questionText}</h2>
                {mode === "answers" && question.type === "multiple_choice" ? (
                  <p className="mt-1 text-[13px] font-semibold text-black">
                    Correct answer: {question.correctAnswerKey ?? "-"}
                  </p>
                ) : null}
              </div>
            </div>

            {question.type === "multiple_choice" ? (
              <div className="pl-8">
                <div className="grid gap-x-6 gap-y-1 text-[14px] leading-7 md:grid-cols-2 print:grid-cols-2 print:text-[13px] print:leading-6">
                  {question.options.map((option) => (
                    <div key={option.key} className="flex items-start gap-2">
                      <span className="shrink-0 font-medium">{option.key}.</span>
                      <span>{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : mode === "student" ? (
              <div className="space-y-2 pl-8">
                {Array.from({ length: 4 }).map((_, lineIndex) => (
                  <div
                    key={`${question.publicId}-line-${lineIndex}`}
                    className="h-6 border-b border-[rgba(0,0,0,0.45)]"
                  />
                ))}
              </div>
            ) : (
              <div className="pl-8 text-[13px] leading-6 text-black">
                <p className="font-semibold">Expected review:</p>
                <p className="mt-1 text-[rgba(0,0,0,0.72)]">
                  Essay answer dinilai manual oleh guru.
                </p>
                {question.teacherNotes ? (
                  <p className="mt-2">
                    <span className="font-semibold">Teacher notes:</span>{" "}
                    {question.teacherNotes}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </section>
    </article>
  );
}

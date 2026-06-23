"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { RotateCcw, Sparkles, WandSparkles } from "lucide-react";
import { generateAiExamClientAction } from "@/app/actions";
import { aiPromptPresets, difficultyLevels, getDifficultyDescription } from "@/lib/utils";
import { ActionStateOverlay } from "./action-state-overlay";
import { Button, Field, Input, Notice, Select, Textarea } from "./ui";
import { useToast } from "./toast-provider";

type ApplyMode = "create_new" | "replace" | "append";

export function AiExamComposerForm({
  examPublicId,
  initialValues,
  showApiNotice = false,
}: {
  examPublicId?: string;
  initialValues: {
    title: string;
    topicPrompt: string;
    difficultyLevel: string;
    mcqCount: number;
    essayCount: number;
    outputLanguage: string;
    studentContext: string;
    extraInstructions: string;
  };
  showApiNotice?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");
  const [activeMode, setActiveMode] = useState<ApplyMode>(
    examPublicId ? "replace" : "create_new",
  );
  const [title, setTitle] = useState(initialValues.title);
  const [topicPrompt, setTopicPrompt] = useState(initialValues.topicPrompt);
  const [difficultyLevel, setDifficultyLevel] = useState(initialValues.difficultyLevel);
  const [mcqCount, setMcqCount] = useState(String(initialValues.mcqCount));
  const [essayCount, setEssayCount] = useState(String(initialValues.essayCount));
  const [outputLanguage, setOutputLanguage] = useState(initialValues.outputLanguage);
  const [studentContext, setStudentContext] = useState(initialValues.studentContext);
  const [extraInstructions, setExtraInstructions] = useState(initialValues.extraInstructions);
  const [successCopy, setSuccessCopy] = useState({
    title: "Draft siap.",
    description: "Kami sedang membuka editor supaya kamu bisa lanjut review.",
  });

  const loadingCopy = useMemo(() => {
    if (activeMode === "append") {
      return {
        title: "Gemini sedang menambah soal baru.",
        description:
          "Kami lagi menyusun soal tambahan yang tetap nyambung dengan materi dan difficulty yang kamu pilih.",
      };
    }

    if (activeMode === "replace") {
      return {
        title: "Gemini sedang menyusun ulang draft.",
        description:
          "Kami lagi membentuk versi baru yang lebih rapi untuk menggantikan draft soal saat ini.",
      };
    }

    return {
      title: "Gemini sedang menyusun draft.",
      description:
        "Kami lagi membentuk soal pilihan ganda dan essay sesuai prompt, difficulty, dan jumlah yang kamu pilih.",
    };
  }, [activeMode]);

  function applyPreset(presetId: (typeof aiPromptPresets)[number]["id"]) {
    const preset = aiPromptPresets.find((entry) => entry.id === presetId);

    if (!preset) {
      return;
    }

    setTopicPrompt(preset.topicPrompt);
    setExtraInstructions(preset.extraInstructions);
  }

  function runSubmit(mode: ApplyMode) {
    const form = formRef.current;

    if (!form || !form.reportValidity()) {
      return;
    }

    setActiveMode(mode);
    setPhase("loading");

    const formData = new FormData(form);
    formData.set("applyMode", mode);

    startTransition(async () => {
      const result = await generateAiExamClientAction(formData);

      if (!result.ok) {
        setPhase("idle");
        showToast({ tone: "error", message: result.message });
        return;
      }

      showToast({ tone: "success", message: result.message });
      setSuccessCopy({
        title: mode === "append" ? "Soal tambahan sudah siap." : "Draft sudah siap.",
        description:
          mode === "append"
            ? "Kami sedang menampilkan update terbaru di draft kamu."
            : "Sebentar ya, kami sedang membuka hasil terbaru supaya kamu bisa langsung review.",
      });
      setPhase("success");

      window.setTimeout(() => {
        if (result.redirectTo && result.redirectTo !== pathname) {
          router.push(result.redirectTo);
        } else {
          router.refresh();
          setPhase("idle");
        }
      }, 900);
    });
  }

  return (
    <>
      <ActionStateOverlay
        kind="ai"
        phase={phase}
        loadingTitle={loadingCopy.title}
        loadingDescription={loadingCopy.description}
        successTitle={successCopy.title}
        successDescription={successCopy.description}
        steps={[
          "Reading your prompt and teacher intent",
          "Balancing difficulty with question count",
          "Formatting the draft for editing",
        ]}
      />

      <form ref={formRef} className="grid gap-5 md:grid-cols-2">
        {examPublicId ? <input type="hidden" name="examPublicId" value={examPublicId} /> : null}

        <div className="space-y-5 md:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            {aiPromptPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="inline-flex min-h-10 items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text)] hover:border-[rgba(69,26,245,0.24)] hover:bg-[var(--color-surface)]"
              >
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                {preset.label}
              </button>
            ))}
          </div>

          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Preset ini cuma titik awal. Setelah dipilih, kamu tetap bebas edit prompt dan instruksi tambahan sesuai kebutuhan muridmu.
          </p>

          {showApiNotice ? (
            <Notice tone="info">
              Isi <code>GEMINI_API_KEY</code> di <code>.env.local</code> supaya mode AI bisa jalan.
            </Notice>
          ) : null}
        </div>

        <Field label="Judul exam">
          <Input name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Reading Comprehension Test" required />
        </Field>
        <Field label="Difficulty">
          <Select
            name="difficultyLevel"
            value={difficultyLevel}
            onChange={(event) => setDifficultyLevel(event.target.value)}
          >
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>
                {level} - {getDifficultyDescription(level)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Prompt materi">
            <Textarea
              name="topicPrompt"
              value={topicPrompt}
              onChange={(event) => setTopicPrompt(event.target.value)}
              placeholder="Buat ujian Bahasa Inggris tentang simple past tense untuk murid SMP."
              required
            />
          </Field>
        </div>
        <Field label="Jumlah pilihan ganda">
          <Input
            name="mcqCount"
            type="number"
            min={0}
            max={20}
            value={mcqCount}
            onChange={(event) => setMcqCount(event.target.value)}
            required
          />
        </Field>
        <Field label="Jumlah essay">
          <Input
            name="essayCount"
            type="number"
            min={0}
            max={10}
            value={essayCount}
            onChange={(event) => setEssayCount(event.target.value)}
            required
          />
        </Field>
        <Field label="Bahasa output">
          <Input
            name="outputLanguage"
            value={outputLanguage}
            onChange={(event) => setOutputLanguage(event.target.value)}
            required
          />
        </Field>
        <Field label="Konteks murid">
          <Input
            name="studentContext"
            value={studentContext}
            onChange={(event) => setStudentContext(event.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Instruksi tambahan">
            <Textarea
              name="extraInstructions"
              value={extraInstructions}
              onChange={(event) => setExtraInstructions(event.target.value)}
              placeholder="Fokus pada grammar sederhana, hindari kosakata yang terlalu berat."
            />
          </Field>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-3">
          {examPublicId ? (
            <>
              <Button
                type="button"
                className="gap-2"
                onClick={() => runSubmit("replace")}
                disabled={isPending}
                aria-disabled={isPending}
              >
                <RotateCcw className="h-4 w-4" />
                Regenerate & Replace
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                onClick={() => runSubmit("append")}
                disabled={isPending}
                aria-disabled={isPending}
              >
                <WandSparkles className="h-4 w-4" />
                Append Questions
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="gap-2"
              onClick={() => runSubmit("create_new")}
              disabled={isPending}
              aria-disabled={isPending}
            >
              <WandSparkles className="h-4 w-4" />
              Generate Draft dari Gemini
            </Button>
          )}
        </div>
      </form>
    </>
  );
}

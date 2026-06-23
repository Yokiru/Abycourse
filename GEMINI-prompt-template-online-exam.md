# Gemini Prompt Template - Online Exam Generator

## 1. Tujuan

Template ini dipakai server untuk menghasilkan draft exam Bahasa Inggris yang terstruktur dan mudah diparse.

## 2. System Prompt

```text
You are an expert English private tutor assessment generator.

Your job is to create a clean and age-appropriate English exam based on the teacher's request.

Rules:
- Return valid JSON only.
- Do not wrap the JSON in markdown.
- Do not include explanations before or after the JSON.
- Follow the requested number of multiple-choice and essay questions exactly.
- Multiple-choice questions must always include exactly 4 options with keys A, B, C, and D.
- Every multiple-choice question must include one correctAnswerKey.
- Essay questions must not include options.
- Keep the difficulty aligned to the requested CEFR-style level: A1, A2, B1, B2, or C1.
- Use natural, grammatically correct English unless the teacher explicitly requests another output language.
- Keep questions varied and useful for real student evaluation.
- Avoid duplicated questions.

Return JSON with this exact shape:
{
  "title": "string",
  "instructions": "string",
  "questions": [
    {
      "type": "multiple_choice",
      "questionText": "string",
      "options": [
        { "key": "A", "text": "string" },
        { "key": "B", "text": "string" },
        { "key": "C", "text": "string" },
        { "key": "D", "text": "string" }
      ],
      "correctAnswerKey": "A"
    },
    {
      "type": "essay",
      "questionText": "string"
    }
  ]
}
```

## 3. User Prompt Template

```text
Create an English exam draft with the following requirements:

Exam title: {{title}}
Topic or material: {{topicPrompt}}
Difficulty level: {{difficultyLevel}}
Number of multiple-choice questions: {{mcqCount}}
Number of essay questions: {{essayCount}}
Output language: {{outputLanguage}}
Student profile or context: {{studentContext}}
Additional teacher instructions: {{extraInstructions}}

Important quality rules:
- Match the difficulty to {{difficultyLevel}}.
- If the teacher asks for grammar, make the questions grammar-focused.
- If the teacher asks for reading, include short reading-oriented questions when appropriate.
- If the teacher asks for vocabulary, make distractors plausible but not confusing in a broken way.
- Make essay questions answerable by the student's level.
- Avoid making all questions too similar.
- Keep the instructions short and clear.
```

## 4. Example Filled Prompt

```text
Create an English exam draft with the following requirements:

Exam title: Simple Past Tense Practice
Topic or material: Make an online test about simple past tense for junior high school students.
Difficulty level: A2
Number of multiple-choice questions: 8
Number of essay questions: 2
Output language: English
Student profile or context: Indonesian private English student, middle school age
Additional teacher instructions: Focus on affirmative, negative, and interrogative sentences. Keep the wording simple.

Important quality rules:
- Match the difficulty to A2.
- If the teacher asks for grammar, make the questions grammar-focused.
- If the teacher asks for reading, include short reading-oriented questions when appropriate.
- If the teacher asks for vocabulary, make distractors plausible but not confusing in a broken way.
- Make essay questions answerable by the student's level.
- Avoid making all questions too similar.
- Keep the instructions short and clear.
```

## 5. Repair Prompt

Gunakan prompt ini jika output Gemini gagal divalidasi.

```text
Your previous response did not match the required JSON schema.

Please try again.

Return valid JSON only.
Do not include markdown.
Do not include commentary.
Make sure:
- the JSON is syntactically valid
- the number of multiple-choice questions is exactly {{mcqCount}}
- the number of essay questions is exactly {{essayCount}}
- every multiple-choice item has exactly 4 options
- every multiple-choice item has a valid correctAnswerKey
```

## 6. Validation Checklist Server

Sebelum hasil AI disimpan sebagai draft:

- parse JSON berhasil
- ada `title`
- ada `instructions`
- `questions` berupa array
- jumlah MCQ sesuai
- jumlah essay sesuai
- semua MCQ punya 4 opsi
- semua key opsi lengkap `A-D`
- semua MCQ punya `correctAnswerKey`
- semua essay tidak punya opsi

## 7. Saran Penggunaan

- simpan prompt payload untuk debugging
- tampilkan hasil AI sebagai draft, bukan final
- berikan tombol regenerate dan manual edit
- batasi total jumlah soal agar biaya dan latensi tetap kecil

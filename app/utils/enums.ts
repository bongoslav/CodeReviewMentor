export const supportedLanguages = ["javascript", "python", "java"] as const;

export type Language = typeof supportedLanguages[number];
// const supportedLanguages = languages.map(l => l.value) as [typeof languages[number]["value"]];

export const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
] as const;

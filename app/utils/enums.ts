export const supportedLanguages = ["javascript", "python", "java"] as const;

export type Language = typeof supportedLanguages[number];

export const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
] as const;

export type CompanyNameProblem = "empty" | "tooLong";

const MAX_COMPANY_NAME_LENGTH = 30;

export function companyNameProblem(name: string): CompanyNameProblem | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "empty";
  }
  if (trimmed.length > MAX_COMPANY_NAME_LENGTH) {
    return "tooLong";
  }
  return null;
}

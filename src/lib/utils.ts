import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uniqueById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function removeSpecialCharacters(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "");
}

export function formatCPF(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2");
}

export function formatCNPJ(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 14);
  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})/, "$1-$2");
}

export function formatCpfCnpjInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return formatCPF(digits);
  }
  return formatCNPJ(digits);
}

export function formatDocument(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) return formatCPF(value);
  if (digits.length === 14) return formatCNPJ(value);
  return value;
}

export function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDatePtBR(
  date: string | Date | null | undefined,
): string {
  if (!date) return "";
  try {
    const d =
      typeof date === "string"
        ? date.length === 10
          ? new Date(`${date}T00:00:00`)
          : new Date(date)
        : date;
    if (Number.isNaN(d.getTime())) return typeof date === "string" ? date : "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return typeof date === "string" ? date : "";
  }
}

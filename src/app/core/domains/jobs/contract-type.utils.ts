import { ContractType } from './job-taxonomy.model';

export const CONTRACT_TYPES: readonly ContractType[] = [
  'b2b',
  'employment',
  'internship',
  'service-contract',
];

const LEGACY_CONTRACT_TYPES: Record<string, ContractType> = {
  uop: 'employment',
  uz: 'service-contract',
};

export function isContractType(value: string): value is ContractType {
  return (CONTRACT_TYPES as readonly string[]).includes(value);
}

export function normalizeContractType(value: string): ContractType | null {
  const mapped = LEGACY_CONTRACT_TYPES[value] ?? value;
  return isContractType(mapped) ? mapped : null;
}

export function normalizeContractTypes(
  value: unknown,
  fallback: ContractType[] = ['b2b'],
): ContractType[] {
  if (!Array.isArray(value) || !value.length) {
    return fallback;
  }

  const normalized = value
    .map((entry) => normalizeContractType(String(entry)))
    .filter((entry): entry is ContractType => entry !== null);

  const unique = [...new Set(normalized)];
  return unique.length ? unique : fallback;
}

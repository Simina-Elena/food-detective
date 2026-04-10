type HealthVerdict = 'healthy' | 'not healthy' | 'unknown';

export function getHealthVerdict(grade?: string): HealthVerdict {
  const normalizedGrade = grade?.toLowerCase();

  if (!normalizedGrade) {
    return 'unknown';
  }

  if (normalizedGrade === 'a' || normalizedGrade === 'b') {
    return 'healthy';
  }

  return 'not healthy';
}

export function getHealthReason(grade?: string): string {
  const normalizedGrade = grade?.toLowerCase();

  if (!normalizedGrade) {
    return 'No Nutri-Score is available for this product yet.';
  }

  if (normalizedGrade === 'a' || normalizedGrade === 'b') {
    return `Nutri-Score ${normalizedGrade.toUpperCase()} is treated as healthy in this first version.`;
  }

  return `Nutri-Score ${normalizedGrade.toUpperCase()} is treated as not healthy in this first version.`;
}

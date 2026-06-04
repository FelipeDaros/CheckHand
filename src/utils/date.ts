export function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function isOverdue(ts: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return ts * 1000 < today.getTime();
}

export function isSoon(ts: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + 2);
  const ms = ts * 1000;
  return ms >= today.getTime() && ms <= limit.getTime();
}

export function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

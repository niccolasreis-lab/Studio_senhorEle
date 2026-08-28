const pad = (value: number) => String(value).padStart(2, '0');

export const toDateTimeLocalInput = (value: string | Date = new Date()): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const dateTimeLocalToIso = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Data e hora inválidas.');
  return date.toISOString();
};

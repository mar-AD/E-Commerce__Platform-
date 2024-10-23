

export function timestampToDate({ seconds, nanos }): Date {
  return new Date(seconds * 1000 + nanos / 1000000); // Convert seconds and nanoseconds to milliseconds
}


export function dateToTimestamp(date: Date | null | undefined): { seconds: number, nanos: number } | null {
  if (!date) return null;

  const seconds = Math.floor(date.getTime() / 1000);
  const nanos = (date.getTime() % 1000) * 1000000; // Convert milliseconds to nanoseconds
  console.log('mytimestamp', { seconds, nanos });
  console.log('thwl', timestampToDate({ seconds, nanos }));
  return { seconds, nanos };
}
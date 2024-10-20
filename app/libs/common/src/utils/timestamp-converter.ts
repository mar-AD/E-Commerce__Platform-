import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

export function timestampToDate(timestamp: Timestamp): Date {
  const seconds = timestamp.getSeconds();
  const nanos = timestamp.getNanos();
  return new Date(seconds * 1000 + nanos / 1000000); // Convert seconds and nanoseconds to milliseconds
}


export function dateToTimestamp(date: Date | null | undefined): Timestamp | null {
  // Check if the date is null or undefined
  if (!date) return null;

  const timestamp = new Timestamp();
  timestamp.setSeconds(Math.floor(date.getTime() / 1000));
  timestamp.setNanos((date.getTime() % 1000) * 1000000); // Convert milliseconds to nanoseconds
  console.log('mytimestamp',timestamp);
  return timestamp; // Return the constructed Timestamp
}
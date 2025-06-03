import { format, parse } from 'date-fns';

export function formatDate(inputDate: string): string {
  const parsedDate = parse(inputDate, 'MM/dd/yyyy', new Date());
  return format(parsedDate, 'yyyy-MM-dd HH:mm:ss.SSS');
}

export function safeToLocaleDateString(date: any): string {
  try {
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime())
      ? 'Invalid Date'
      : dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  } catch (error) {
    return 'Invalid Date';
  }
}

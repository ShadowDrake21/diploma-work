import { format, parse } from 'date-fns';

function formatDate(inputDate: string): string {
  const parsedDate = parse(inputDate, 'MM/dd/yyyy', new Date());
  return format(parsedDate, 'yyyy-MM-dd HH:mm:ss.SSS');
}

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

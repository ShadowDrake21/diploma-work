import { ErrorTruncateTextPipe } from './error-truncate-text.pipe';

describe('ErrorTruncateTextPipe', () => {
  const pipe = new ErrorTruncateTextPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return original string when shorter than limit', () => {
    const shortText = 'Short text';
    expect(pipe.transform(shortText)).toBe(shortText);
  });

  it('should truncate text with default trail when longer than limit', () => {
    const longText =
      'This is a very long text that should be truncated when it exceeds the character limit';
    const result = pipe.transform(longText, 20);
    expect(result).toBe('This is a very long...');
  });

  it('should use custom trail when provided', () => {
    const longText =
      'This is a very long text that should be truncated when it exceeds the character limit';
    const result = pipe.transform(longText, 20, '~~~');
    expect(result).toBe('This is a very long~~~');
  });

  it('should use mobile limit when window is small', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });

    const longText =
      'This is a very long text that should be truncated when it exceeds the character limit';
    const result = pipe.transform(longText, 20);
    expect(result).toBe('This is a ver...');
  });
});

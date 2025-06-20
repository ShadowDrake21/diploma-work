import { TruncateTextPipe } from './truncate-text.pipe';

describe('TruncateTextPipe', () => {
  let pipe: TruncateTextPipe;

  beforeEach(() => {
    pipe = new TruncateTextPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the same string if shorter than length', () => {
    const input = 'Short text';
    expect(pipe.transform(input, 20)).toBe(input);
  });

  it('should truncate with ellipsis when fullText is false', () => {
    const input = 'This is a long text that needs to be truncated';
    expect(pipe.transform(input, 10)).toBe('This is a ...');
  });

  it('should truncate without ellipsis when fullText is true', () => {
    const input = 'This is a long text that needs to be truncated';
    expect(pipe.transform(input, 10, true)).toBe('This is a ');
  });

  it('should handle empty string', () => {
    expect(pipe.transform('', 10)).toBe('');
  });
});

import { ErrorTruncateTextPipe } from './error-truncate-text.pipe';

describe('ErrorTruncateTextPipe', () => {
  it('create an instance', () => {
    const pipe = new ErrorTruncateTextPipe();
    expect(pipe).toBeTruthy();
  });
});

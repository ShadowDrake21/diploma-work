import { IsNanPipe } from './is-nan.pipe';

describe('IsNanPipe', () => {
  const pipe = new IsNanPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true for NaN', () => {
    expect(pipe.transform(NaN)).toBe(true);
  });

  it('should return false for numbers', () => {
    expect(pipe.transform(0)).toBe(false);
    expect(pipe.transform(42)).toBe(false);
    expect(pipe.transform(-3.14)).toBe(false);
  });

  it('should return false for non-numbers', () => {
    expect(pipe.transform('string')).toBe(false);
    expect(pipe.transform(null)).toBe(false);
    expect(pipe.transform(undefined)).toBe(false);
    expect(pipe.transform({})).toBe(false);
  });
});

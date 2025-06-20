import { OverviewHasDataPipe } from './overview-has-data.pipe';

describe('OverviewHasDataPipe', () => {
  let pipe: OverviewHasDataPipe;

  beforeEach(() => {
    pipe = new OverviewHasDataPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false for empty array', () => {
    expect(pipe.transform([])).toBe(false);
  });

  it('should return false when all values are 0', () => {
    const input = [{ value: 0 }, { value: 0 }];
    expect(pipe.transform(input)).toBe(false);
  });

  it('should return true when at least one value is greater than 0', () => {
    const input = [{ value: 0 }, { value: 1 }];
    expect(pipe.transform(input)).toBe(true);
  });

  it('should return true when all values are greater than 0', () => {
    const input = [{ value: 1 }, { value: 2 }];
    expect(pipe.transform(input)).toBe(true);
  });
});

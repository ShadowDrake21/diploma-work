import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "0 Bytes" for 0 bytes', () => {
    expect(pipe.transform(0)).toBe('0 Bytes');
  });

  it('should format bytes correctly', () => {
    expect(pipe.transform(500)).toBe('500 Bytes');
    expect(pipe.transform(1024)).toBe('1 KB');
    expect(pipe.transform(1500)).toBe('1.46 KB');
    expect(pipe.transform(1048576)).toBe('1 MB');
    expect(pipe.transform(1073741824)).toBe('1 GB');
  });

  it('should respect decimal parameter', () => {
    expect(pipe.transform(1500, 0)).toBe('1 KB');
    expect(pipe.transform(1500, 3)).toBe('1.465 KB');
  });
});

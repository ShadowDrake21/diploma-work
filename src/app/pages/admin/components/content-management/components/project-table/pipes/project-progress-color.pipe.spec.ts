import { ProjectProgressColorPipe } from './project-progress-color.pipe';

describe('ProjectProgressColorPipe', () => {
  let pipe: ProjectProgressColorPipe;

  beforeEach(() => {
    pipe = new ProjectProgressColorPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "warn" for progress < 50', () => {
    expect(pipe.transform(0)).toBe('warn');
    expect(pipe.transform(49)).toBe('warn');
  });

  it('should return "accent" for progress between 50 and 80', () => {
    expect(pipe.transform(50)).toBe('accent');
    expect(pipe.transform(79)).toBe('accent');
  });

  it('should return "primary" for progress >= 80', () => {
    expect(pipe.transform(80)).toBe('primary');
    expect(pipe.transform(100)).toBe('primary');
  });
});

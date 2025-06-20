import { ProjectType } from '@shared/enums/categories.enum';
import { LocalProjectTypePipe } from './local-project-type.pipe';

describe('LocalProjectTypePipe', () => {
  let pipe: LocalProjectTypePipe;

  beforeEach(() => {
    pipe = new LocalProjectTypePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Публікація" for PUBLICATION type', () => {
    expect(pipe.transform(ProjectType.PUBLICATION)).toBe('Публікація');
  });

  it('should return "Патент" for PATENT type', () => {
    expect(pipe.transform(ProjectType.PATENT)).toBe('Патент');
  });

  it('should return "Дослідження" for RESEARCH type', () => {
    expect(pipe.transform(ProjectType.RESEARCH)).toBe('Дослідження');
  });
});

import { ProjectType } from '@shared/enums/categories.enum';
import { ProjectTypeNamePipe } from './project-type-name.pipe';

describe('ProjectTypeNamePipe', () => {
  let pipe: ProjectTypeNamePipe;

  beforeEach(() => {
    pipe = new ProjectTypeNamePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return correct type names', () => {
    expect(pipe.transform(ProjectType.PUBLICATION)).toBe('PUBLICATION');
    expect(pipe.transform(ProjectType.PATENT)).toBe('PATENT');
    expect(pipe.transform(ProjectType.RESEARCH)).toBe('RESEARCH');
  });
});

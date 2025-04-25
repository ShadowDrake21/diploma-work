import { ProjectType } from '@shared/enums/categories.enum';

export function stringToProjectType(value: string): ProjectType | null {
  const projectTypeKey = Object.keys(ProjectType).find((key) => key === value);

  return projectTypeKey
    ? ProjectType[projectTypeKey as keyof typeof ProjectType]
    : null;
}

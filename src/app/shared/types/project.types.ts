export type ProjectItem = {
  id: number;
  projectTitle: string;
  deadline: string;
  statusProgress: string;
  progress: number;
  type: string;
};

export type Project = {
  id: string;
  type: string;
  title: string;
  progress: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  tagIds: string[];
};

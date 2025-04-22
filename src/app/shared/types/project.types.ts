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
  publication?: Publication;
  patent?: Patent;
  research?: Research;
};

interface Publication {
  source?: string;
  doiIsbn?: string;
}

interface Patent {
  registrationNumber?: string;
  issuingAuthority?: string;
}

interface Research {
  budget?: number;
  fundingSource?: string;
}

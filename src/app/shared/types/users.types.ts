export interface IUser {
  id: string;
  fullName: string;
  profilePicture: string;
  role: string;
  affiliation: string;
  email: string;
  phone: string;
  publications: number;
  patents: number;
  ongoingProjects: number;
  lastActive: string;
  status: string;
  tags: string[];
}

export interface ICreateUser {
  email: string;
  password: string;
  role: string;
}

export interface IAuthorizedUser {
  id: number;
  email: string;
  role: string;
}

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

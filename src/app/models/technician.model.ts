export interface Technician {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  credential: string;
  skill: string[]; 
  availability?: string[];
  createdAt?: string;
  updatedAt?: string;
}

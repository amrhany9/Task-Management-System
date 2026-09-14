export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  ownerId: string;
  ownerName: string;
  taskCount: number;
}

export interface ProjectRequest {
  name: string;
  description: string;
}

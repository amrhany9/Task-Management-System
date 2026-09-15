export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  ownerId: string;
  ownerName: string;
  taskCount: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
}

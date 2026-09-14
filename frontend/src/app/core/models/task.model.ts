export enum TaskItemStatus {
  ToDo = 1,
  InProgress = 2,
  Done = 3
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskItemStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  assigneeId: string | null;
  assigneeName: string | null;
}

export interface TaskRequest {
  title: string;
  description: string;
  status: TaskItemStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
}

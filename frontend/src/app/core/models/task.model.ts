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

/** New tasks always start at `ToDo`; the API ignores any client-supplied status. */
export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  status: TaskItemStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
}

import { Pipe, PipeTransform } from '@angular/core';
import { TaskItemStatus, TaskPriority } from '../../core/models/task.model';

const STATUS_LABELS: Record<TaskItemStatus, string> = {
  [TaskItemStatus.ToDo]: 'To Do',
  [TaskItemStatus.InProgress]: 'In Progress',
  [TaskItemStatus.Done]: 'Done'
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'Low',
  [TaskPriority.Medium]: 'Medium',
  [TaskPriority.High]: 'High'
};

@Pipe({ name: 'taskStatusLabel', standalone: true })
export class TaskStatusLabelPipe implements PipeTransform {
  transform(value: TaskItemStatus): string {
    return STATUS_LABELS[value];
  }
}

@Pipe({ name: 'taskPriorityLabel', standalone: true })
export class TaskPriorityLabelPipe implements PipeTransform {
  transform(value: TaskPriority): string {
    return PRIORITY_LABELS[value];
  }
}

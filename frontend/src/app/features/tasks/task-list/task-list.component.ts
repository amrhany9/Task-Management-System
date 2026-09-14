import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { TaskItem, TaskItemStatus, TaskPriority, TaskRequest } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskPriorityLabelPipe, TaskStatusLabelPipe } from '../task-status-label.pipe';

const STATUS_CLASSES: Record<TaskItemStatus, string> = {
  [TaskItemStatus.ToDo]: 'bg-slate-50 text-slate-600 ring-slate-200',
  [TaskItemStatus.InProgress]: 'bg-blue-50 text-blue-700 ring-blue-200',
  [TaskItemStatus.Done]: 'bg-emerald-50 text-emerald-700 ring-emerald-200'
};

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'bg-slate-50 text-slate-600 ring-slate-200',
  [TaskPriority.Medium]: 'bg-amber-50 text-amber-700 ring-amber-200',
  [TaskPriority.High]: 'bg-red-50 text-red-700 ring-red-200'
};

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskFormComponent, TaskStatusLabelPipe, TaskPriorityLabelPipe, DatePipe],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnChanges {
  private readonly taskService = inject(TaskService);

  @Input({ required: true }) projectId!: string;

  readonly TaskItemStatus = TaskItemStatus;
  readonly tasks = this.taskService.tasks;
  readonly errorMessage = signal<string | null>(null);
  readonly editingTaskId = signal<string | null>(null);

  ngOnChanges(): void {
    this.taskService.loadByProject(this.projectId).subscribe({
      error: () => this.errorMessage.set('Unable to load tasks.')
    });
  }

  statusClasses(status: TaskItemStatus): string {
    return STATUS_CLASSES[status];
  }

  priorityClasses(priority: TaskPriority): string {
    return PRIORITY_CLASSES[priority];
  }

  createTask(request: TaskRequest): void {
    this.taskService.create(this.projectId, request).subscribe({
      error: () => this.errorMessage.set('Unable to create task.')
    });
  }

  startEditing(task: TaskItem): void {
    this.editingTaskId.set(task.id);
  }

  saveTask(taskId: string, request: TaskRequest): void {
    this.taskService.update(taskId, request).subscribe({
      next: () => this.editingTaskId.set(null),
      error: () => this.errorMessage.set('Unable to update task.')
    });
  }

  deleteTask(taskId: string): void {
    if (!confirm('Delete this task?')) {
      return;
    }

    this.taskService.delete(taskId).subscribe({
      error: () => this.errorMessage.set('Unable to delete task.')
    });
  }
}

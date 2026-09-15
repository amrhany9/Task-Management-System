import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import {
  CreateTaskRequest,
  TaskItem,
  TaskItemStatus,
  TaskPriority,
  UpdateTaskRequest
} from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskPriorityLabelPipe, TaskStatusLabelPipe } from '../task-status-label.pipe';

const STATUS_CLASSES: Record<TaskItemStatus, string> = {
  [TaskItemStatus.ToDo]: 'bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  [TaskItemStatus.InProgress]: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900',
  [TaskItemStatus.Done]: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900'
};

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  [TaskPriority.Medium]: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900',
  [TaskPriority.High]: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900'
};

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskFormComponent, ConfirmDialogComponent, TaskStatusLabelPipe, TaskPriorityLabelPipe, DatePipe],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnChanges {
  private readonly taskService = inject(TaskService);

  @Input({ required: true }) projectId!: string;

  readonly TaskItemStatus = TaskItemStatus;
  readonly tasks = this.taskService.tasks;

  readonly isLoading = signal(true);
  readonly isCreating = signal(false);
  readonly savingTaskId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly editingTaskId = signal<string | null>(null);
  readonly pendingDeletion = signal<TaskItem | null>(null);
  readonly isDeleting = signal(false);

  /** Skeleton rows rendered while the first load is in flight. */
  readonly skeletonRows = [0, 1, 2];

  ngOnChanges(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService.loadByProject(this.projectId).subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to load tasks.');
      }
    });
  }

  statusClasses(status: TaskItemStatus): string {
    return STATUS_CLASSES[status];
  }

  priorityClasses(priority: TaskPriority): string {
    return PRIORITY_CLASSES[priority];
  }

  createTask(request: CreateTaskRequest): void {
    this.isCreating.set(true);
    this.errorMessage.set(null);

    this.taskService.create(this.projectId, request).subscribe({
      next: () => this.isCreating.set(false),
      error: () => {
        this.isCreating.set(false);
        this.errorMessage.set('Unable to create task.');
      }
    });
  }

  startEditing(task: TaskItem): void {
    this.editingTaskId.set(task.id);
  }

  saveTask(taskId: string, request: UpdateTaskRequest): void {
    this.savingTaskId.set(taskId);
    this.errorMessage.set(null);

    this.taskService.update(taskId, request).subscribe({
      next: () => {
        this.savingTaskId.set(null);
        this.editingTaskId.set(null);
      },
      error: () => {
        this.savingTaskId.set(null);
        this.errorMessage.set('Unable to update task.');
      }
    });
  }

  requestDelete(task: TaskItem): void {
    this.pendingDeletion.set(task);
  }

  cancelDelete(): void {
    this.pendingDeletion.set(null);
  }

  confirmDelete(): void {
    const task = this.pendingDeletion();
    if (!task) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.pendingDeletion.set(null);
      },
      error: () => {
        this.isDeleting.set(false);
        this.pendingDeletion.set(null);
        this.errorMessage.set('Unable to delete task.');
      }
    });
  }
}

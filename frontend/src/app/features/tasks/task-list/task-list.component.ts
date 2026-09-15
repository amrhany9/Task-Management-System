import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import {
  CreateTaskRequest,
  TaskItem,
  TaskItemStatus,
  TaskPriority,
  UpdateTaskRequest
} from '../../../core/models/task.model';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskService } from '../../../core/services/task.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskPriorityLabelPipe, TaskStatusLabelPipe } from '../task-status-label.pipe';

const STATUS_CLASSES: Record<TaskItemStatus, string> = {
  [TaskItemStatus.ToDo]: 'badge-neutral',
  [TaskItemStatus.InProgress]: 'badge-info',
  [TaskItemStatus.Done]: 'badge-success'
};

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'badge-neutral',
  [TaskPriority.Medium]: 'badge-warning',
  [TaskPriority.High]: 'badge-danger'
};

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    TaskFormComponent,
    ConfirmDialogComponent,
    ModalComponent,
    TaskStatusLabelPipe,
    TaskPriorityLabelPipe,
    DatePipe
  ],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnChanges {
  private readonly taskService = inject(TaskService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true }) projectId!: string;

  readonly TaskItemStatus = TaskItemStatus;
  readonly tasks = this.taskService.tasks;

  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly pendingDeletion = signal<TaskItem | null>(null);
  readonly isDeleting = signal(false);

  /** Null while closed; holds the task being edited, or null-task for create. */
  readonly isFormOpen = signal(false);
  readonly editingTask = signal<TaskItem | null>(null);

  readonly formTitle = computed(() => (this.editingTask() ? 'Edit task' : 'New task'));
  readonly formSubtitle = computed(() =>
    this.editingTask() ? 'Update the details for this task.' : 'New tasks start in the To Do column.'
  );

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

  openCreate(): void {
    this.editingTask.set(null);
    this.isFormOpen.set(true);
  }

  openEdit(task: TaskItem): void {
    this.editingTask.set(task);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingTask.set(null);
  }

  createTask(request: CreateTaskRequest): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.taskService.create(this.projectId, request).subscribe({
      next: (task) => {
        this.isSubmitting.set(false);
        this.closeForm();
        this.notificationService.success(`Task “${task.title}” added`);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Unable to create task.');
      }
    });
  }

  saveTask(taskId: string, request: UpdateTaskRequest): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.taskService.update(taskId, request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeForm();
        this.notificationService.success('Task updated');
      },
      error: () => {
        this.isSubmitting.set(false);
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
        this.notificationService.success(`Task “${task.title}” deleted`);
      },
      error: () => {
        this.isDeleting.set(false);
        this.pendingDeletion.set(null);
        this.errorMessage.set('Unable to delete task.');
      }
    });
  }
}

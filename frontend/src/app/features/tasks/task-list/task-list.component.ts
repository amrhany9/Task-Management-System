import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { TaskItem, TaskRequest } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskPriorityLabelPipe, TaskStatusLabelPipe } from '../task-status-label.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskFormComponent, TaskStatusLabelPipe, TaskPriorityLabelPipe, DatePipe],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnChanges {
  private readonly taskService = inject(TaskService);

  @Input({ required: true }) projectId!: string;

  readonly tasks = this.taskService.tasks;
  readonly errorMessage = signal<string | null>(null);
  readonly editingTaskId = signal<string | null>(null);

  ngOnChanges(): void {
    this.taskService.loadByProject(this.projectId).subscribe({
      error: () => this.errorMessage.set('Unable to load tasks.')
    });
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

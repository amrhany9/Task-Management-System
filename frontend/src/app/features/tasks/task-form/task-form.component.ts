import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateTaskRequest,
  TaskItem,
  TaskItemStatus,
  TaskPriority,
  UpdateTaskRequest
} from '../../../core/models/task.model';
import { TaskPriorityLabelPipe, TaskStatusLabelPipe } from '../task-status-label.pipe';

/**
 * Task create/update form, hosted inside a modal.
 *
 * Emits a create payload when adding and an update payload when editing: the API
 * only accepts a status on update, since new tasks always start at `ToDo`.
 */
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule, TaskStatusLabelPipe, TaskPriorityLabelPipe],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnChanges {
  @Input() task: TaskItem | null = null;
  @Input() isBusy = false;

  @Output() create = new EventEmitter<CreateTaskRequest>();
  @Output() update = new EventEmitter<UpdateTaskRequest>();
  @Output() cancel = new EventEmitter<void>();

  readonly statuses = [TaskItemStatus.ToDo, TaskItemStatus.InProgress, TaskItemStatus.Done];
  readonly priorities = [TaskPriority.Low, TaskPriority.Medium, TaskPriority.High];

  title = '';
  description = '';
  status: TaskItemStatus = TaskItemStatus.ToDo;
  priority: TaskPriority = TaskPriority.Medium;
  dueDate = '';

  ngOnChanges(): void {
    this.title = this.task?.title ?? '';
    this.description = this.task?.description ?? '';
    this.status = this.task?.status ?? TaskItemStatus.ToDo;
    this.priority = this.task?.priority ?? TaskPriority.Medium;
    this.dueDate = this.task?.dueDate?.substring(0, 10) ?? '';
  }

  get isTitleMissing(): boolean {
    return !this.title.trim();
  }

  submit(): void {
    if (this.isTitleMissing || this.isBusy) {
      return;
    }

    const dueDate = this.dueDate ? new Date(this.dueDate).toISOString() : null;

    if (this.task) {
      this.update.emit({
        title: this.title,
        description: this.description,
        status: Number(this.status),
        priority: Number(this.priority),
        dueDate,
        assigneeId: this.task.assigneeId
      });
      return;
    }

    this.create.emit({
      title: this.title,
      description: this.description,
      priority: Number(this.priority),
      dueDate,
      assigneeId: null
    });
  }
}

import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskItem, TaskItemStatus, TaskPriority, TaskRequest } from '../../../core/models/task.model';
import { TaskPriorityLabelPipe, TaskStatusLabelPipe } from '../task-status-label.pipe';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule, TaskStatusLabelPipe, TaskPriorityLabelPipe],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnChanges {
  @Input() task: TaskItem | null = null;
  @Output() save = new EventEmitter<TaskRequest>();
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

  submit(): void {
    if (!this.title.trim()) {
      return;
    }

    this.save.emit({
      title: this.title,
      description: this.description,
      status: Number(this.status),
      priority: Number(this.priority),
      dueDate: this.dueDate ? new Date(this.dueDate).toISOString() : null,
      assigneeId: this.task?.assigneeId ?? null
    });
  }
}

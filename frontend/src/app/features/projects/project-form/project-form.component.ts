import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateProjectRequest, Project, UpdateProjectRequest } from '../../../core/models/project.model';

/**
 * Project create/update form, hosted inside a modal.
 *
 * Emits a create payload when `project` is null and an update payload otherwise,
 * mirroring how TaskFormComponent splits the two request types.
 */
@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './project-form.component.html'
})
export class ProjectFormComponent implements OnChanges {
  @Input() project: Project | null = null;
  @Input() isBusy = false;

  @Output() create = new EventEmitter<CreateProjectRequest>();
  @Output() update = new EventEmitter<UpdateProjectRequest>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  description = '';

  ngOnChanges(): void {
    this.name = this.project?.name ?? '';
    this.description = this.project?.description ?? '';
  }

  get isNameMissing(): boolean {
    return !this.name.trim();
  }

  submit(): void {
    if (this.isNameMissing || this.isBusy) {
      return;
    }

    if (this.project) {
      this.update.emit({ name: this.name, description: this.description });
      return;
    }

    this.create.emit({ name: this.name, description: this.description });
  }
}

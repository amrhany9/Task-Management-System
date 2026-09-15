import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Project } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { TaskListComponent } from '../../tasks/task-list/task-list.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, TaskListComponent, ConfirmDialogComponent],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  readonly project = signal<Project | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditing = signal(false);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isConfirmingDelete = signal(false);
  readonly isDeleting = signal(false);

  editName = '';
  editDescription = '';

  private projectId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';

    this.projectService.getById(this.projectId).subscribe({
      next: (project) => {
        this.isLoading.set(false);
        this.project.set(project);
        this.editName = project.name;
        this.editDescription = project.description;
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Project not found or you do not have access to it.');
      }
    });
  }

  get isNameMissing(): boolean {
    return !this.editName.trim();
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  saveProject(): void {
    if (this.isNameMissing || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.projectService.update(this.projectId, { name: this.editName, description: this.editDescription }).subscribe({
      next: (updated) => {
        this.isSaving.set(false);
        this.project.set(updated);
        this.isEditing.set(false);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Unable to update project.');
      }
    });
  }

  requestDelete(): void {
    this.isConfirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.isConfirmingDelete.set(false);
  }

  confirmDelete(): void {
    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.projectService.delete(this.projectId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isConfirmingDelete.set(false);
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.isDeleting.set(false);
        this.isConfirmingDelete.set(false);
        this.errorMessage.set('Unable to delete project.');
      }
    });
  }
}

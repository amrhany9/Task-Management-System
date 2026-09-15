import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Project, UpdateProjectRequest } from '../../../core/models/project.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ProjectService } from '../../../core/services/project.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { TaskListComponent } from '../../tasks/task-list/task-list.component';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, TaskListComponent, ConfirmDialogComponent, ModalComponent, ProjectFormComponent],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  readonly project = signal<Project | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly isLoading = signal(true);
  readonly isEditOpen = signal(false);
  readonly isSaving = signal(false);
  readonly isConfirmingDelete = signal(false);
  readonly isDeleting = signal(false);

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
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Project not found or you do not have access to it.');
      }
    });
  }

  openEdit(): void {
    this.isEditOpen.set(true);
  }

  closeEdit(): void {
    this.isEditOpen.set(false);
  }

  saveProject(request: UpdateProjectRequest): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.projectService.update(this.projectId, request).subscribe({
      next: (updated) => {
        this.isSaving.set(false);
        this.isEditOpen.set(false);
        this.project.set(updated);
        this.notificationService.success('Project updated');
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
        this.notificationService.success('Project deleted');
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

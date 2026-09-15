import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CreateProjectRequest, Project } from '../../../core/models/project.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ProjectService } from '../../../core/services/project.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, DatePipe, ConfirmDialogComponent, ModalComponent, ProjectFormComponent],
  templateUrl: './project-list.component.html'
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly notificationService = inject(NotificationService);

  readonly projects = this.projectService.projects;

  readonly isLoading = signal(true);
  readonly isCreating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isCreateOpen = signal(false);
  readonly pendingDeletion = signal<Project | null>(null);
  readonly isDeleting = signal(false);

  /** Skeleton cards rendered while the first load is in flight. */
  readonly skeletonCards = [0, 1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.projectService.load().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to load projects.');
      }
    });
  }

  openCreate(): void {
    this.isCreateOpen.set(true);
  }

  closeCreate(): void {
    this.isCreateOpen.set(false);
  }

  createProject(request: CreateProjectRequest): void {
    this.isCreating.set(true);
    this.errorMessage.set(null);

    this.projectService.create(request).subscribe({
      next: (project) => {
        this.isCreating.set(false);
        this.isCreateOpen.set(false);
        this.notificationService.success(`Project “${project.name}” created`);
      },
      error: () => {
        this.isCreating.set(false);
        this.errorMessage.set('Unable to create project.');
      }
    });
  }

  requestDelete(project: Project): void {
    this.pendingDeletion.set(project);
  }

  cancelDelete(): void {
    this.pendingDeletion.set(null);
  }

  confirmDelete(): void {
    const project = this.pendingDeletion();
    if (!project) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.projectService.delete(project.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.pendingDeletion.set(null);
        this.notificationService.success(`Project “${project.name}” deleted`);
      },
      error: () => {
        this.isDeleting.set(false);
        this.pendingDeletion.set(null);
        this.errorMessage.set('Unable to delete project.');
      }
    });
  }
}

import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Project } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, ConfirmDialogComponent],
  templateUrl: './project-list.component.html'
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  readonly projects = this.projectService.projects;

  readonly isLoading = signal(true);
  readonly isCreating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly pendingDeletion = signal<Project | null>(null);
  readonly isDeleting = signal(false);

  /** Skeleton cards rendered while the first load is in flight. */
  readonly skeletonCards = [0, 1, 2, 3];

  newProjectName = '';
  newProjectDescription = '';

  ngOnInit(): void {
    this.projectService.load().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to load projects.');
      }
    });
  }

  get isNameMissing(): boolean {
    return !this.newProjectName.trim();
  }

  createProject(): void {
    if (this.isNameMissing || this.isCreating()) {
      return;
    }

    this.isCreating.set(true);
    this.errorMessage.set(null);

    this.projectService
      .create({ name: this.newProjectName, description: this.newProjectDescription })
      .subscribe({
        next: () => {
          this.isCreating.set(false);
          this.newProjectName = '';
          this.newProjectDescription = '';
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
      },
      error: () => {
        this.isDeleting.set(false);
        this.pendingDeletion.set(null);
        this.errorMessage.set('Unable to delete project.');
      }
    });
  }
}

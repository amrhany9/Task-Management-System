import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Project } from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { TaskListComponent } from '../../tasks/task-list/task-list.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, TaskListComponent],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  readonly project = signal<Project | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditing = signal(false);

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
        this.project.set(project);
        this.editName = project.name;
        this.editDescription = project.description;
      },
      error: () => this.errorMessage.set('Project not found or you do not have access to it.')
    });
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  saveProject(): void {
    this.projectService.update(this.projectId, { name: this.editName, description: this.editDescription }).subscribe({
      next: (updated) => {
        this.project.set(updated);
        this.isEditing.set(false);
      },
      error: () => this.errorMessage.set('Unable to update project.')
    });
  }

  deleteProject(): void {
    if (!confirm('Delete this project and all of its tasks?')) {
      return;
    }

    this.projectService.delete(this.projectId).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: () => this.errorMessage.set('Unable to delete project.')
    });
  }
}

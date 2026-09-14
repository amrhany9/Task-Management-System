import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  readonly projects = this.projectService.projects;
  readonly errorMessage = signal<string | null>(null);

  newProjectName = '';
  newProjectDescription = '';

  ngOnInit(): void {
    this.projectService.load().subscribe({
      error: () => this.errorMessage.set('Unable to load projects.')
    });
  }

  createProject(): void {
    if (!this.newProjectName.trim()) {
      return;
    }

    this.projectService
      .create({ name: this.newProjectName, description: this.newProjectDescription })
      .subscribe({
        next: () => {
          this.newProjectName = '';
          this.newProjectDescription = '';
        },
        error: () => this.errorMessage.set('Unable to create project.')
      });
  }

  deleteProject(id: string): void {
    if (!confirm('Delete this project and all of its tasks?')) {
      return;
    }

    this.projectService.delete(id).subscribe({
      error: () => this.errorMessage.set('Unable to delete project.')
    });
  }
}

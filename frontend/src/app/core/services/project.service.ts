import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateProjectRequest, Project, UpdateProjectRequest } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly projectsSignal = signal<Project[]>([]);
  readonly projects = this.projectsSignal.asReadonly();

  private readonly baseUrl = `${environment.apiBaseUrl}/projects`;

  constructor(private readonly http: HttpClient) {}

  load(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl).pipe(tap((projects) => this.projectsSignal.set(projects)));
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateProjectRequest): Observable<Project> {
    return this.http
      .post<Project>(this.baseUrl, request)
      .pipe(tap((project) => this.projectsSignal.update((projects) => [project, ...projects])));
  }

  update(id: string, request: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, request).pipe(
      tap((updated) =>
        this.projectsSignal.update((projects) => projects.map((project) => (project.id === id ? updated : project)))
      )
    );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.projectsSignal.update((projects) => projects.filter((project) => project.id !== id))));
  }
}

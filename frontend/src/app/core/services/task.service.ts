import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly tasksSignal = signal<TaskItem[]>([]);
  readonly tasks = this.tasksSignal.asReadonly();

  private readonly baseUrl = `${environment.apiBaseUrl}`;

  constructor(private readonly http: HttpClient) {}

  loadByProject(projectId: string): Observable<TaskItem[]> {
    return this.http
      .get<TaskItem[]>(`${this.baseUrl}/projects/${projectId}/tasks`)
      .pipe(tap((tasks) => this.tasksSignal.set(tasks)));
  }

  create(projectId: string, request: CreateTaskRequest): Observable<TaskItem> {
    return this.http
      .post<TaskItem>(`${this.baseUrl}/projects/${projectId}/tasks`, request)
      .pipe(tap((task) => this.tasksSignal.update((tasks) => [task, ...tasks])));
  }

  update(id: string, request: UpdateTaskRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.baseUrl}/tasks/${id}`, request).pipe(
      tap((updated) => this.tasksSignal.update((tasks) => tasks.map((task) => (task.id === id ? updated : task))))
    );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/tasks/${id}`)
      .pipe(tap(() => this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id))));
  }
}

# Task Management System

A full-stack task management application: users register/log in, create projects, and manage tasks within each project (status, priority, due date, assignee).

## Stack

- **Backend**: ASP.NET Core 8 Web API in a Clean Architecture solution (Domain / Application / Infrastructure / API), EF Core (SQL Server), JWT authentication (hand-rolled, no external identity library).
- **Frontend**: Angular 20, standalone components, signals for state, Tailwind CSS v4, no external UI/state libraries.

## Backend — `backend/`

Requires a SQL Server instance. The connection string lives in `TaskManagement.API/appsettings.Development.json`.

```bash
cd backend
dotnet tool restore
dotnet ef database update --project TaskManagement.Infrastructure --startup-project TaskManagement.API
dotnet run --project TaskManagement.API
```

API listens on `http://localhost:5109` by default (see `TaskManagement.API/Properties/launchSettings.json`) and serves Swagger UI at `/swagger` in Development.

Configuration:
- `appsettings.json` — shared, non-environment-specific settings only.
- `appsettings.Development.json` — local connection string and full JWT settings (including the dev-only signing key).
- `appsettings.Production.json` — same shape with empty connection string / signing key placeholders; supply real values via environment variables or a secret store at deploy time, never commit real production secrets here.

### Project layout

Dependencies point inward only — `Domain` references nothing, `API` references outward layers but never the other way around:

```
TaskManagement.Domain          Entities, Enums, typed exceptions. No dependencies.
TaskManagement.Application     DTOs, repository/service interfaces, business logic.
                               Depends on Domain only.
TaskManagement.Infrastructure  DbContext + EF configurations, repositories, JWT token
                               generation, password hashing, migrations.
                               Depends on Application + Domain.
TaskManagement.API             Controllers, middleware, CurrentUserService, DI composition.
                               Depends on Application + Infrastructure.
```

Each outward layer exposes an `AddApplication()` / `AddInfrastructure(configuration)` extension method, so `Program.cs` composes the graph without knowing concrete types.

### DTO conventions

Request DTOs are separated per operation rather than shared between create and update, so each endpoint accepts exactly the fields it supports:

- `CreateProjectRequest` / `UpdateProjectRequest` / `ProjectResponse`
- `CreateTaskRequest` / `UpdateTaskRequest` / `TaskResponse`
- `RegisterRequest` / `LoginRequest` / `AuthResponse`

`CreateTaskRequest` deliberately omits `Status`: new tasks always start at `ToDo`, and only `UpdateTaskRequest` can change it.

### Migrations

Migrations live in `TaskManagement.Infrastructure/Persistence/Migrations`. The tool manifest is at `backend/.config/dotnet-tools.json`, so run `dotnet ef` from the `backend/` directory with both projects specified:

```bash
dotnet ef migrations add <Name> --project TaskManagement.Infrastructure --startup-project TaskManagement.API --output-dir Persistence/Migrations
```

## Frontend — `frontend/`

```bash
cd frontend
npm install
npm start
```

Serves on `http://localhost:4200` and expects the API at `http://localhost:5109/api` (see `src/environments/environment.ts`).

## Architecture notes

- Authorization model: a `Project` belongs to one owner (`User`); only the owner can read/update/delete it or its `Task`s. Enforced in the Application layer, not just controllers.
- Cross-cutting concerns are inverted: `IPasswordHasher`, `IJwtTokenGenerator` and `ICurrentUserService` are declared in Application; the first two are implemented in Infrastructure and `CurrentUserService` in the API layer, since it reads the HTTP context.
- Frontend: `core/services` hold signal-based state per resource (Projects, Tasks, Auth) and wrap `HttpClient`; `core/interceptors` attach the JWT and handle 401s; `core/guards` protects authenticated routes; `features/*` holds route-level standalone components; `shared/*` holds reusable presentational components.
- Styling is Tailwind CSS v4, wired through `@tailwindcss/postcss` via `.postcssrc.json` (v4 is config-less — theme tokens and the `dark` variant live in `src/styles.css`). Shared primitives (`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`, `.field-input`, `.field-label`, `.card`, `.badge`, `.alert-error`, `.skeleton`) are defined once in `src/styles.css`, so there are no per-component stylesheets.
- Dark mode is class-based: `ThemeService` mirrors the active theme onto `<html class="dark">`, seeded from `localStorage` and falling back to `prefers-color-scheme`.
- Destructive actions route through the shared `ConfirmDialogComponent` (an accessible `role="alertdialog"`) rather than `window.confirm`, and lists render skeleton placeholders while loading.
- SSO is not implemented in this pass — local JWT auth covers authentication for CRUD ownership.

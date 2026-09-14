# Task Management System

A full-stack task management application: users register/log in, create projects, and manage tasks within each project (status, priority, due date, assignee).

## Stack

- **Backend**: ASP.NET Core 8 Web API, EF Core (SQL Server / LocalDB), JWT authentication (hand-rolled, no external identity library).
- **Frontend**: Angular 20, standalone components, signals for state, no external UI/state libraries.

## Backend — `backend/TaskManagement.API`

Requires SQL Server LocalDB (`(localdb)\MSSQLLocalDB`, installed with SQL Server Express/LocalDB or Visual Studio).

```bash
cd backend/TaskManagement.API
dotnet tool restore
dotnet ef database update
dotnet run
```

API listens on `http://localhost:5109` by default (see `Properties/launchSettings.json`) and serves Swagger UI at `/swagger` in Development.

Configuration:
- `appsettings.json` — shared, non-environment-specific settings only.
- `appsettings.Development.json` — local connection string and full JWT settings (including the dev-only signing key).
- `appsettings.Production.json` — same shape with empty connection string / signing key placeholders; supply real values via environment variables or a secret store at deploy time, never commit real production secrets here.

## Frontend — `frontend/`

```bash
cd frontend
npm install
npm start
```

Serves on `http://localhost:4200` and expects the API at `http://localhost:5109/api` (see `src/environments/environment.ts`).

## Architecture notes

- Backend is a single API project layered by folders: `Entities` (EF models), `Enums`, `Dtos`, `Data` (DbContext) with `Data/Configurations` (one `IEntityTypeConfiguration<T>` per entity, applied via `ApplyConfigurationsFromAssembly`), `Interfaces/Repositories` and `Interfaces/Services` (abstractions, separated from implementations), `Repositories` (data access), `Services` (business logic + authorization), `Controllers` (thin HTTP layer), `Middlewares` (cross-cutting error handling), `Exceptions` (typed domain exceptions mapped to HTTP status codes).
- Authorization model: a `Project` belongs to one owner (`User`); only the owner can read/update/delete it or its `Task`s. Enforced in the service layer, not just controllers.
- Frontend: `core/services` hold signal-based state per resource (Projects, Tasks, Auth) and wrap `HttpClient`; `core/interceptors` attach the JWT and handle 401s; `core/guards` protects authenticated routes; `features/*` holds route-level standalone components.
- Styling is Tailwind CSS v4, wired through `@tailwindcss/postcss` via `.postcssrc.json` (v4 is config-less — theme tokens live in the `@theme` block of `src/styles.css`). Components carry utility classes in their templates; shared primitives (`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.field-input`, `.field-label`, `.card`, `.badge`, `.alert-error`) are defined once in `src/styles.css`, so there are no per-component stylesheets.
- SSO is not implemented in this pass (see task notes) — local JWT auth covers authentication for CRUD ownership.

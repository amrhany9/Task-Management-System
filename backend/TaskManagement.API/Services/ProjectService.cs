using TaskManagement.API.Dtos.Projects;
using TaskManagement.API.Entities;
using TaskManagement.API.Exceptions;
using TaskManagement.API.Interfaces.Repositories;
using TaskManagement.API.Interfaces.Services;

namespace TaskManagement.API.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly ICurrentUserService _currentUser;

        public ProjectService(IProjectRepository projectRepository, ICurrentUserService currentUser)
        {
            _projectRepository = projectRepository;
            _currentUser = currentUser;
        }

        public async Task<List<ProjectResponse>> GetOwnedProjectsAsync()
        {
            var projects = await _projectRepository.GetByOwnerAsync(_currentUser.UserId);
            return projects.Select(ToResponse).ToList();
        }

        public async Task<ProjectResponse> GetByIdAsync(Guid id)
        {
            var project = await GetOwnedProjectOrThrowAsync(id);
            return ToResponse(project);
        }

        public async Task<ProjectResponse> CreateAsync(ProjectRequest request)
        {
            ValidateRequest(request);

            var project = new Project
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                OwnerId = _currentUser.UserId,
                CreatedAt = DateTime.UtcNow
            };

            await _projectRepository.AddAsync(project);

            var created = await _projectRepository.GetByIdWithOwnerAsync(project.Id)
                ?? throw new NotFoundException("Project was created but could not be reloaded.");

            return ToResponse(created);
        }

        public async Task<ProjectResponse> UpdateAsync(Guid id, ProjectRequest request)
        {
            ValidateRequest(request);

            var project = await GetOwnedProjectOrThrowAsync(id);
            project.Name = request.Name;
            project.Description = request.Description;

            _projectRepository.Update(project);
            await _projectRepository.SaveChangesAsync();

            return ToResponse(project);
        }

        public async Task DeleteAsync(Guid id)
        {
            var project = await GetOwnedProjectOrThrowAsync(id);
            _projectRepository.Remove(project);
            await _projectRepository.SaveChangesAsync();
        }

        private async Task<Project> GetOwnedProjectOrThrowAsync(Guid id)
        {
            var project = await _projectRepository.GetByIdWithOwnerAsync(id)
                ?? throw new NotFoundException($"Project '{id}' was not found.");

            if (project.OwnerId != _currentUser.UserId)
            {
                throw new ForbiddenException("You do not have access to this project.");
            }

            return project;
        }

        private static void ValidateRequest(ProjectRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ValidationException("Project name is required.");
            }
        }

        private static ProjectResponse ToResponse(Project project)
        {
            return new ProjectResponse
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                CreatedAt = project.CreatedAt,
                OwnerId = project.OwnerId,
                OwnerName = project.Owner?.Name ?? string.Empty,
                TaskCount = project.Tasks.Count
            };
        }
    }
}

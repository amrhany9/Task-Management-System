using TaskManagement.Application.Dtos.Projects;

namespace TaskManagement.Application.Interfaces.Services
{
    public interface IProjectService
    {
        Task<List<ProjectResponse>> GetOwnedProjectsAsync();
        Task<ProjectResponse> GetByIdAsync(Guid id);
        Task<ProjectResponse> CreateAsync(CreateProjectRequest request);
        Task<ProjectResponse> UpdateAsync(Guid id, UpdateProjectRequest request);
        Task DeleteAsync(Guid id);
    }
}

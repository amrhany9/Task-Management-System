using TaskManagement.API.Dtos.Projects;

namespace TaskManagement.API.Interfaces.Services
{
    public interface IProjectService
    {
        Task<List<ProjectResponse>> GetOwnedProjectsAsync();
        Task<ProjectResponse> GetByIdAsync(Guid id);
        Task<ProjectResponse> CreateAsync(ProjectRequest request);
        Task<ProjectResponse> UpdateAsync(Guid id, ProjectRequest request);
        Task DeleteAsync(Guid id);
    }
}

using TaskManagement.API.Dtos.Tasks;

namespace TaskManagement.API.Interfaces.Services
{
    public interface ITaskService
    {
        Task<List<TaskResponse>> GetByProjectAsync(Guid projectId);
        Task<TaskResponse> GetByIdAsync(Guid id);
        Task<TaskResponse> CreateAsync(Guid projectId, TaskRequest request);
        Task<TaskResponse> UpdateAsync(Guid id, TaskRequest request);
        Task DeleteAsync(Guid id);
    }
}

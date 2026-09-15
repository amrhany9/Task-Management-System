using TaskManagement.Application.Dtos.Tasks;

namespace TaskManagement.Application.Interfaces.Services
{
    public interface ITaskService
    {
        Task<List<TaskResponse>> GetByProjectAsync(Guid projectId);
        Task<TaskResponse> GetByIdAsync(Guid id);
        Task<TaskResponse> CreateAsync(Guid projectId, CreateTaskRequest request);
        Task<TaskResponse> UpdateAsync(Guid id, UpdateTaskRequest request);
        Task DeleteAsync(Guid id);
    }
}

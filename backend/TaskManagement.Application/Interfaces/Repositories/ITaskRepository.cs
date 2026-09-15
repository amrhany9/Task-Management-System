using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Repositories
{
    public interface ITaskRepository
    {
        Task<List<TaskItem>> GetByProjectAsync(Guid projectId);
        Task<TaskItem?> GetByIdAsync(Guid id);
        Task<TaskItem?> GetByIdWithProjectAsync(Guid id);
        Task AddAsync(TaskItem task);
        void Update(TaskItem task);
        void Remove(TaskItem task);
        Task SaveChangesAsync();
    }
}

using TaskManagement.API.Entities;

namespace TaskManagement.API.Interfaces.Repositories
{
    public interface IProjectRepository
    {
        Task<List<Project>> GetByOwnerAsync(Guid ownerId);
        Task<Project?> GetByIdAsync(Guid id);
        Task<Project?> GetByIdWithOwnerAsync(Guid id);
        Task AddAsync(Project project);
        void Update(Project project);
        void Remove(Project project);
        Task SaveChangesAsync();
    }
}

using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByGoogleSubjectIdAsync(string googleSubjectId);
        Task<bool> ExistsAsync(Guid id);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
    }
}

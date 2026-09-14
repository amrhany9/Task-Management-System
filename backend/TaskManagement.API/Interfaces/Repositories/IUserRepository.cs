using TaskManagement.API.Entities;

namespace TaskManagement.API.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> ExistsAsync(Guid id);
        Task AddAsync(User user);
    }
}

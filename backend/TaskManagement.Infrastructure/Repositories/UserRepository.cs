using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Persistence;

namespace TaskManagement.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly TaskManagementDbContext _context;

        public UserRepository(TaskManagementDbContext context)
        {
            _context = context;
        }

        public Task<User?> GetByIdAsync(Guid id)
        {
            return _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public Task<User?> GetByEmailAsync(string email)
        {
            return _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public Task<User?> GetByGoogleSubjectIdAsync(string googleSubjectId)
        {
            return _context.Users.FirstOrDefaultAsync(u => u.GoogleSubjectId == googleSubjectId);
        }

        public Task<bool> ExistsAsync(Guid id)
        {
            return _context.Users.AnyAsync(u => u.Id == id);
        }

        public async Task AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}

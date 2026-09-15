using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Services
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}

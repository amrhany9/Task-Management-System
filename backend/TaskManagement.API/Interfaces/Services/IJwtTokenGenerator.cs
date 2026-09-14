using TaskManagement.API.Entities;

namespace TaskManagement.API.Interfaces.Services
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}

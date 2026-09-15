using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TaskManagement.Application.Interfaces.Services;

namespace TaskManagement.API.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid UserId
        {
            get
            {
                var subjectClaim = _httpContextAccessor.HttpContext?.User
                    .FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                    ?? _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (subjectClaim is null || !Guid.TryParse(subjectClaim, out var userId))
                {
                    throw new InvalidOperationException("No authenticated user found on the current request.");
                }

                return userId;
            }
        }
    }
}

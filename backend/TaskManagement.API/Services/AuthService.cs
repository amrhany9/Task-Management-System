using TaskManagement.API.Dtos.Auth;
using TaskManagement.API.Entities;
using TaskManagement.API.Exceptions;
using TaskManagement.API.Interfaces.Repositories;
using TaskManagement.API.Interfaces.Services;

namespace TaskManagement.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtTokenGenerator _tokenGenerator;

        public AuthService(IUserRepository userRepository, IJwtTokenGenerator tokenGenerator)
        {
            _userRepository = userRepository;
            _tokenGenerator = tokenGenerator;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ValidationException("Name, email and password are required.");
            }

            if (request.Password.Length < 8)
            {
                throw new ValidationException("Password must be at least 8 characters long.");
            }

            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser is not null)
            {
                throw new ValidationException("A user with this email already exists.");
            }

            var (hash, salt) = PasswordHasher.Hash(request.Password);

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);

            return BuildAuthResponse(user);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                throw new ValidationException("Invalid email or password.");
            }

            return BuildAuthResponse(user);
        }

        private AuthResponse BuildAuthResponse(User user)
        {
            return new AuthResponse
            {
                Token = _tokenGenerator.GenerateToken(user),
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email
            };
        }
    }
}

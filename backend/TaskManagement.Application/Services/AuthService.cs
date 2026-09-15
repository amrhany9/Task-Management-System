using TaskManagement.Application.Dtos.Auth;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;

namespace TaskManagement.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtTokenGenerator _tokenGenerator;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IGoogleTokenValidator _googleTokenValidator;

        public AuthService(
            IUserRepository userRepository,
            IJwtTokenGenerator tokenGenerator,
            IPasswordHasher passwordHasher,
            IGoogleTokenValidator googleTokenValidator)
        {
            _userRepository = userRepository;
            _tokenGenerator = tokenGenerator;
            _passwordHasher = passwordHasher;
            _googleTokenValidator = googleTokenValidator;
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

            var (hash, salt) = _passwordHasher.Hash(request.Password);

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

            // A user linked only to Google has no password: short-circuit before
            // hashing rather than verifying against a null credential. The message
            // stays generic so the response does not reveal which emails exist or
            // how they authenticate.
            if (user is null ||
                user.PasswordHash is null ||
                user.PasswordSalt is null ||
                !_passwordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                throw new ValidationException("Invalid email or password.");
            }

            return BuildAuthResponse(user);
        }

        public async Task<AuthResponse> GoogleSignInAsync(GoogleSignInRequest request)
        {
            var info = await _googleTokenValidator.ValidateAsync(request.IdToken);

            // Match on the Google subject first: it is stable even if the user
            // changes the email on their Google account.
            var user = await _userRepository.GetByGoogleSubjectIdAsync(info.Subject);
            if (user is not null)
            {
                return BuildAuthResponse(user);
            }

            var existingByEmail = await _userRepository.GetByEmailAsync(info.Email);
            if (existingByEmail is not null)
            {
                // Link to the local account. Safe because the validator rejects
                // tokens whose email is not verified by Google. Password fields are
                // left untouched so password login keeps working.
                existingByEmail.GoogleSubjectId = info.Subject;
                existingByEmail.GoogleLinkedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(existingByEmail);

                return BuildAuthResponse(existingByEmail);
            }

            var created = new User
            {
                Id = Guid.NewGuid(),
                Name = ResolveDisplayName(info),
                Email = info.Email,
                GoogleSubjectId = info.Subject,
                GoogleLinkedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(created);

            return BuildAuthResponse(created);
        }

        private static string ResolveDisplayName(GoogleUserInfo info)
        {
            if (!string.IsNullOrWhiteSpace(info.Name))
            {
                return info.Name;
            }

            var separatorIndex = info.Email.IndexOf('@');
            return separatorIndex > 0 ? info.Email[..separatorIndex] : info.Email;
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

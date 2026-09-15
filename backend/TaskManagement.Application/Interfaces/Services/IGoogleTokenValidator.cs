using TaskManagement.Application.Dtos.Auth;

namespace TaskManagement.Application.Interfaces.Services
{
    public interface IGoogleTokenValidator
    {
        /// <summary>
        /// Verifies a Google ID token and returns its payload.
        /// Throws <see cref="Domain.Exceptions.ValidationException"/> if the token is
        /// invalid, issued for another audience, or carries an unverified email.
        /// </summary>
        Task<GoogleUserInfo> ValidateAsync(string idToken);
    }
}

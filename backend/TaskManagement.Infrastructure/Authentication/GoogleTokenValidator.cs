using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using TaskManagement.Application.Dtos.Auth;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Domain.Exceptions;

namespace TaskManagement.Infrastructure.Authentication
{
    public class GoogleTokenValidator : IGoogleTokenValidator
    {
        private readonly GoogleAuthSettings _settings;

        public GoogleTokenValidator(IOptions<GoogleAuthSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task<GoogleUserInfo> ValidateAsync(string idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken))
            {
                throw new ValidationException("Google credential is required.");
            }

            if (string.IsNullOrWhiteSpace(_settings.ClientId))
            {
                // Misconfiguration, not a bad request: surface as 500 rather than
                // silently accepting tokens with no audience restriction.
                throw new InvalidOperationException("GoogleAuth:ClientId is not configured.");
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                // Audience MUST be set. Leaving it null disables audience validation
                // entirely, which would accept any Google-issued ID token from any
                // application — a full authentication bypass.
                payload = await GoogleJsonWebSignature.ValidateAsync(
                    idToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { _settings.ClientId }
                    });
            }
            catch (InvalidJwtException)
            {
                // Catch only token faults, so a network failure reaching Google's
                // certificate endpoint surfaces as 500 instead of masquerading as
                // a bad credential.
                throw new ValidationException("Invalid Google credential.");
            }

            // Google's library does not check this: without the guard, an unverified
            // account bearing someone else's address could link into that account.
            if (!payload.EmailVerified || string.IsNullOrWhiteSpace(payload.Email))
            {
                throw new ValidationException("Your Google account email is not verified.");
            }

            return new GoogleUserInfo
            {
                Subject = payload.Subject,
                Email = payload.Email,
                EmailVerified = payload.EmailVerified,
                Name = payload.Name ?? string.Empty
            };
        }
    }
}

namespace TaskManagement.Application.Dtos.Auth
{
    /// <summary>
    /// Provider-agnostic view of a validated Google ID token, so the Application
    /// layer never references the Google SDK.
    /// </summary>
    public class GoogleUserInfo
    {
        public string Subject { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool EmailVerified { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}

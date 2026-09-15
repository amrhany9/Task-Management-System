namespace TaskManagement.Application.Dtos.Auth
{
    public class GoogleSignInRequest
    {
        /// <summary>The ID token issued by Google Identity Services in the browser.</summary>
        public string IdToken { get; set; } = string.Empty;
    }
}

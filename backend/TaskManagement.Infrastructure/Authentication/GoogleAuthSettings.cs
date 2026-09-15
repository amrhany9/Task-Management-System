namespace TaskManagement.Infrastructure.Authentication
{
    public class GoogleAuthSettings
    {
        /// <summary>
        /// The Google OAuth web client ID. Also the expected audience of incoming
        /// ID tokens, so it must match the value the browser signs in with.
        /// </summary>
        public string ClientId { get; set; } = string.Empty;
    }
}

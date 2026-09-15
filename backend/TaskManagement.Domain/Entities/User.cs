namespace TaskManagement.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        /// <summary>Null for accounts that authenticate only through an external provider.</summary>
        public byte[]? PasswordHash { get; set; }

        /// <summary>Null for accounts that authenticate only through an external provider.</summary>
        public byte[]? PasswordSalt { get; set; }

        /// <summary>Google's stable subject identifier ("sub"), null until a Google account is linked.</summary>
        public string? GoogleSubjectId { get; set; }

        public DateTime? GoogleLinkedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
    }
}

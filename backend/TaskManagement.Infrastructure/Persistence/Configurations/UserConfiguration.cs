using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasIndex(u => u.Email).IsUnique();

            // Without an explicit length this is nvarchar(max), which SQL Server
            // cannot index.
            builder.Property(u => u.GoogleSubjectId).HasMaxLength(255);

            // Filtered so the many password-only users (NULL subject) do not collide,
            // while still guaranteeing one Google account maps to at most one user.
            builder.HasIndex(u => u.GoogleSubjectId)
                .IsUnique()
                .HasFilter("[GoogleSubjectId] IS NOT NULL");
        }
    }
}

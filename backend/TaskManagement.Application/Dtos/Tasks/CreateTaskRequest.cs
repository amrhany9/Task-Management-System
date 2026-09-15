using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Dtos.Tasks
{
    public class CreateTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TaskPriority Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public Guid? AssigneeId { get; set; }
    }
}

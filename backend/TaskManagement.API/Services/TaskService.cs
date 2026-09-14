using TaskManagement.API.Dtos.Tasks;
using TaskManagement.API.Entities;
using TaskManagement.API.Exceptions;
using TaskManagement.API.Interfaces.Repositories;
using TaskManagement.API.Interfaces.Services;

namespace TaskManagement.API.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserService _currentUser;

        public TaskService(
            ITaskRepository taskRepository,
            IProjectRepository projectRepository,
            IUserRepository userRepository,
            ICurrentUserService currentUser)
        {
            _taskRepository = taskRepository;
            _projectRepository = projectRepository;
            _userRepository = userRepository;
            _currentUser = currentUser;
        }

        public async Task<List<TaskResponse>> GetByProjectAsync(Guid projectId)
        {
            await GetOwnedProjectOrThrowAsync(projectId);
            var tasks = await _taskRepository.GetByProjectAsync(projectId);
            return tasks.Select(ToResponse).ToList();
        }

        public async Task<TaskResponse> GetByIdAsync(Guid id)
        {
            var task = await GetOwnedTaskOrThrowAsync(id);
            return ToResponse(task);
        }

        public async Task<TaskResponse> CreateAsync(Guid projectId, TaskRequest request)
        {
            await ValidateRequestAsync(request);
            await GetOwnedProjectOrThrowAsync(projectId);

            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                Status = request.Status,
                Priority = request.Priority,
                DueDate = request.DueDate,
                AssigneeId = request.AssigneeId,
                ProjectId = projectId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _taskRepository.AddAsync(task);

            var created = await _taskRepository.GetByIdAsync(task.Id)
                ?? throw new NotFoundException("Task was created but could not be reloaded.");

            return ToResponse(created);
        }

        public async Task<TaskResponse> UpdateAsync(Guid id, TaskRequest request)
        {
            await ValidateRequestAsync(request);

            var task = await GetOwnedTaskOrThrowAsync(id);
            task.Title = request.Title;
            task.Description = request.Description;
            task.Status = request.Status;
            task.Priority = request.Priority;
            task.DueDate = request.DueDate;
            task.AssigneeId = request.AssigneeId;
            task.UpdatedAt = DateTime.UtcNow;

            _taskRepository.Update(task);
            await _taskRepository.SaveChangesAsync();

            var updated = await _taskRepository.GetByIdAsync(id)
                ?? throw new NotFoundException("Task was updated but could not be reloaded.");

            return ToResponse(updated);
        }

        public async Task DeleteAsync(Guid id)
        {
            var task = await GetOwnedTaskOrThrowAsync(id);
            _taskRepository.Remove(task);
            await _taskRepository.SaveChangesAsync();
        }

        private async Task<Project> GetOwnedProjectOrThrowAsync(Guid projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId)
                ?? throw new NotFoundException($"Project '{projectId}' was not found.");

            if (project.OwnerId != _currentUser.UserId)
            {
                throw new ForbiddenException("You do not have access to this project.");
            }

            return project;
        }

        private async Task<TaskItem> GetOwnedTaskOrThrowAsync(Guid id)
        {
            var task = await _taskRepository.GetByIdWithProjectAsync(id)
                ?? throw new NotFoundException($"Task '{id}' was not found.");

            if (task.Project.OwnerId != _currentUser.UserId)
            {
                throw new ForbiddenException("You do not have access to this task.");
            }

            return task;
        }

        private async Task ValidateRequestAsync(TaskRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new ValidationException("Task title is required.");
            }

            if (request.AssigneeId.HasValue && !await _userRepository.ExistsAsync(request.AssigneeId.Value))
            {
                throw new ValidationException($"Assignee '{request.AssigneeId}' does not exist.");
            }
        }

        private static TaskResponse ToResponse(TaskItem task)
        {
            return new TaskResponse
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                ProjectId = task.ProjectId,
                AssigneeId = task.AssigneeId,
                AssigneeName = task.Assignee?.Name
            };
        }
    }
}

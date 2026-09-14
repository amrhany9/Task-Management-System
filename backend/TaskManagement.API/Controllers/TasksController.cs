using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.Dtos.Tasks;
using TaskManagement.API.Interfaces.Services;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("api/projects/{projectId:guid}/tasks")]
        public async Task<ActionResult<List<TaskResponse>>> GetByProject(Guid projectId)
        {
            var tasks = await _taskService.GetByProjectAsync(projectId);
            return Ok(tasks);
        }

        [HttpGet("api/tasks/{id:guid}")]
        public async Task<ActionResult<TaskResponse>> GetById(Guid id)
        {
            var task = await _taskService.GetByIdAsync(id);
            return Ok(task);
        }

        [HttpPost("api/projects/{projectId:guid}/tasks")]
        public async Task<ActionResult<TaskResponse>> Create(Guid projectId, TaskRequest request)
        {
            var created = await _taskService.CreateAsync(projectId, request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("api/tasks/{id:guid}")]
        public async Task<ActionResult<TaskResponse>> Update(Guid id, TaskRequest request)
        {
            var updated = await _taskService.UpdateAsync(id, request);
            return Ok(updated);
        }

        [HttpDelete("api/tasks/{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _taskService.DeleteAsync(id);
            return NoContent();
        }
    }
}

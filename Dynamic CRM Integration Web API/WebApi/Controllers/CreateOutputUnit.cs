using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class CreateOutputUnit : ControllerBase
    {
        private readonly ILogger<CreateOutputUnit> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public CreateOutputUnit(ILogger<CreateOutputUnit> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Create a new Output Unit entry from the given data.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /Todo
        ///     {
        ///         "outputUnitOther": "new entry delete me"
        ///     }
        ///
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the new Output Unit entry.</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("CreateOutputUnit")]
        [SwaggerOperation(Summary = "Create an Output Unit entry.", Description = "Create a new Output Unit entry from the given data.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> CreateOutputUnitEntry(RequestCreateOutputUnit data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    RequestReturnId returnIds = new RequestReturnId();

                    if (data.outputUnitOther != null)        // create new output unit entry and get its id
                    {
                        Entity outputUnit = new("desnz_outputunit");

                        outputUnit["desnz_name"] = data.outputUnitOther;

                        // create output unit
                        outputUnit.Id = await serviceClient.CreateAsync(outputUnit);
                        returnIds.id = outputUnit.Id;

                        outputUnit["statecode"] = new OptionSetValue(1);     // deactivate new entry
                        await serviceClient.UpdateAsync(outputUnit);

                        _logger.LogInformation("Created new Output Unit entry at {DT} with id : {id}", DateTime.UtcNow.ToLongTimeString(), returnIds.id.ToString());

                        return Ok(returnIds);
                    }
                    ReplyMessage reply = new ReplyMessage();
                    reply.message = "outputUnitOther field is null";
                    return BadRequest(reply);

                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);

            }
        }
        public class RequestCreateOutputUnit
        {
            [Required]
            public Guid idSubmission { get; set; }
            [Required]
            public string? outputUnitOther { get; set; }

        }

    }
}

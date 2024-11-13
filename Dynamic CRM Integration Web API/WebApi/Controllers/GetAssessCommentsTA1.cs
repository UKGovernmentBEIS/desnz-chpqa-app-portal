using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Services;
using Person = WebApi.Model.Person;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class GetAssessCommentsTA1 : ControllerBase
    {

        private readonly ILogger<GetAssessCommentsTA1> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetAssessCommentsTA1(ILogger<GetAssessCommentsTA1> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Retrieves a list of all comments the TA1 has committed based of the assessor's assessment with the submission status before the submit assessment.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of all comments the TA1 has committed based of the assessor's assessment with the submission status before the submit assessment.</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(List<ReplyAssessCommentsTA1>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetAssessCommentsTA1")]
        [SwaggerOperation(Summary = "Get all comments the TA1 has committed based of the assessor's assessment with the submission status before the submit assessment.", Description = "Retrieves a list of all comments the TA1 has committed based of the assessor's assessment with the submission status before the submit assessment.")]
        public async Task<ActionResult<ReplyAssessCommentsTA1>> AssessCommentsTA1([FromQuery, Required] Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    int userType = await GetUserRoleFun.GetRoleOfUser(User, serviceClient);

                    ReplyAssessCommentsTA1 replyAssessCommentsTA1 = null;
                    // edit check fun from marios branch


                    if (userType == (int)Person.UserType.TechnicalAssessor)
                    {
                        replyAssessCommentsTA1 = await CheckSubmAssessStatusFun.CheckSubmAssessStatusFromList(idSubmission, serviceClient, _logger);
                    }
                    else if (userType == (int)Person.UserType.TechnicalAssessor2 || userType == (int)Person.UserType.ResponsiblePerson)
                    {
                        replyAssessCommentsTA1 = await CheckSubmAssessStatusFun.CheckSubmAssessStatus(userType, idSubmission, serviceClient, _logger);
                    }
                    

                    return Ok(replyAssessCommentsTA1);
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

        public class ReplyAssessCommentsTA1
        {
            public int submissionStatus { get; set; }
            public List<ReplySubmissionGroupCommentsTA1> groupList { get; set; }

        }
        public class ReplySubmissionGroupCommentsTA1
        {
            public Guid? id { get; set; }
            public string? name { get; set; }
            public string? submittedName { get; set; }
            public int? groupCategory { get; set; }
            public int? groupType { get; set; }
            public int? assessorStatus { get; set; }
            public int? displayOrder { get; set; }

            public string? AssessmentComment { get; set; }    // desnz_sectionassessmentcomment

        }


        

        
    }
}



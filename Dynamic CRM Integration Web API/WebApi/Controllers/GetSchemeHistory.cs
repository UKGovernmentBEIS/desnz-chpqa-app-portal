using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/assessors")]
    [ApiController]
    public class GetSchemeHistory : ControllerBase
    {
        private readonly ILogger<GetSchemeHistory> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetSchemeHistory(ILogger<GetSchemeHistory> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Retrievesthe Submission history of a Scheme id
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the Submission history of a Scheme</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(List<ReplySubmissionHistory>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetSchemeHistory")]
        [SwaggerOperation(Summary = "Get the Submission history of a Scheme id", Description = "Retrieves the Submission history of a Scheme id")]
        public async Task<ActionResult<ReplySubmission>> GetSchemeHistoryFun([Required] Guid? schemeId)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    List<ReplySubmissionHistory> submissionList = new List<ReplySubmissionHistory>();

                    QueryExpression querySubmissionList = new QueryExpression
                    {
                        EntityName = "desnz_submission", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_submissionid", "desnz_name", "desnz_submissionformtype", "desnz_year", "desnz_assessorresult"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_scheme", ConditionOperator.Equal, schemeId)
                            }
                        },
                        Orders =
                        {
                            new OrderExpression("createdon", OrderType.Descending)
                        }
                    };

                    EntityCollection resultsSubmission = await serviceClient.RetrieveMultipleAsync(querySubmissionList);

                    List<Guid> submissionIds = resultsSubmission.Entities.Select(submission => submission.Id).ToList();

                    QueryExpression queryCertificationfilesList = new QueryExpression
                    {
                        EntityName = "desnz_certificationfiles", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_certificationfilesid", "desnz_name", "desnz_submission"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.In, submissionIds.ToArray())
                            }
                        },
                        Orders =
                        {
                            new OrderExpression("createdon", OrderType.Descending)
                        }
                    };

                    EntityCollection resultsCertificationFiles = await serviceClient.RetrieveMultipleAsync(queryCertificationfilesList);

                    Dictionary<Guid, ReplySubmissionHistory> submissionHistoryDict = resultsSubmission.Entities
                        .ToDictionary(
                            submission => submission.Id,
                            submission => new ReplySubmissionHistory
                            {
                                id = submission.Id,
                                name = submission.GetAttributeValue<string>("desnz_name"),
                                submissionFormType = submission.GetAttributeValue<OptionSetValue>("desnz_submissionformtype")?.Value,
                                year = submission.GetAttributeValue<string>("desnz_year"),
                                assessorResult = submission.GetAttributeValue<OptionSetValue>("desnz_assessorresult")?.Value,
                                certificatesList = new List<ReplyCertificatesFile>()
                            }
                        );


                    foreach (var certificationFile in resultsCertificationFiles.Entities)
                    {
                        var submissionId = certificationFile.GetAttributeValue<EntityReference>("desnz_submission")?.Id;

                        if (submissionId != null && submissionHistoryDict.TryGetValue(submissionId.Value, out ReplySubmissionHistory submissionHistory))
                        {
                            submissionHistory.certificatesList.Add(new ReplyCertificatesFile
                            {
                                id = certificationFile.Id,
                                fileName = certificationFile.GetAttributeValue<string>("desnz_name")
                            });
                        }
                    }


                    List<ReplySubmissionHistory> submissionHistoryList = submissionHistoryDict.Values.OrderByDescending(submission => submission.year).ToList();

                    return Ok(submissionHistoryList);
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


        public class ReplySubmissionHistory
        {
            public Guid? id { get; set; }
            public string? name { get; set; }
            public int? submissionFormType { get; set; }
            public string? year { get; set; }
            public int? assessorResult { get; set; }
            public string? auditDecisionSummary { get; set; }
            public List<ReplyCertificatesFile> certificatesList { get; set; }

        }

        public class ReplyCertificatesFile
        {
            public Guid? id { get; set; }
            public string? fileName { get; set; }

        }
    }
}





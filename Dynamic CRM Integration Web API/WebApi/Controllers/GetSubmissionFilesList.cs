using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Model;
using WebApi.Contracts;
using WebApi.Services;
using System.Drawing.Imaging;
using DocumentFormat.OpenXml.Vml.Office;
using System.Diagnostics.Metrics;
using System.ComponentModel.DataAnnotations;


namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]

    public class GetSubmissionFilesList : ControllerBase
    {
        private readonly ILogger<GetSubmissionFilesList> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetSubmissionFilesList(ILogger<GetSubmissionFilesList> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Retrieves a Submission Files List of Ids.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of file ids and names by the given id of a Submission and diagram type</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpGet("GetSubmissionFilesList")]
        [SwaggerOperation(Summary = "Get Submission Files List of Ids.", Description = "Retrieves a Submission Files List of Ids.")]
        [ProducesResponseType(typeof(List<ReplySubmissionDiagramFile>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult> SubmissionFilesList([FromQuery] RequestSubmissionFileList data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {                
                    List<ReplySubmissionDiagramFile> fileList = new List<ReplySubmissionDiagramFile>();

                    // Construct the query to fetch the related entities
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_submissiondiagramsfiles",
                        ColumnSet = new ColumnSet("desnz_submissiondiagramsfilesid", "desnz_name", "desnz_diagramtype"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, data.idSubmission),
                                new ConditionExpression("desnz_diagramtype", ConditionOperator.Equal, data.diagramType)
                            }
                        }
                    };

                    // Retrieve the related entities
                    EntityCollection fileResults = await serviceClient.RetrieveMultipleAsync(relatedquery);


                    foreach (Entity fileResult in fileResults.Entities)
                    {

                        ReplySubmissionDiagramFile file = new ReplySubmissionDiagramFile();

                        file.id = fileResult.GetAttributeValue<Guid>("desnz_submissiondiagramsfilesid");
                        file.name = fileResult.GetAttributeValue<string>("desnz_name");


                        fileList.Add(file);

                    }

                    return Ok(fileList);
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

        public class RequestSubmissionFileList
        {
            [Required]
            public Guid? idSubmission { get; set; }
            [Required]
            [Range((int)Submission.FilesType.SchemeEnergyFlowDiagram, (int)Submission.FilesType.UncertaintyFactor)]
            public int? diagramType { get; set; }


        }

    }
}

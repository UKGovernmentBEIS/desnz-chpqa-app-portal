using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using WebApi.Contracts;
using WebApi.Services;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Model;
using WebApi.Functions;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdSubmDiagramComment : ControllerBase
    {
        private readonly ILogger<UpdSubmDiagramComment> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmDiagramComment(ILogger<UpdSubmDiagramComment> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }


        /// <summary>
        /// Create a comment for sections by groupType value.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the submission the comment was added to</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("UpdSubmDiagramComment")]
        [SwaggerOperation(Summary = "Create a comment for specific section", Description = "Creates a comment for specific section by diagramType value")]
        public async Task<ActionResult> PostComment(RequestComment data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();
          
                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(new Guid(data.submissionId), serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    //Fetch Submission to insert comment
                    Entity submissionResult = new Entity("desnz_submission", new Guid(data.submissionId)); // get submission
                    
                        //Assign comment to proper field of Submission
                        if (data.diagramType == (int)Submission.DiagramType.SchemeEnergyFlowDiagram)
                        {
                            submissionResult["desnz_energyflowdiagramcomments"] = data.commentValue;
                        } else if (data.diagramType == (int)Submission.DiagramType.SchemeLineDiagram)
                        {
                            submissionResult["desnz_schemelinediagramcomments"] = data.commentValue;
                        } else if (data.diagramType == (int)Submission.DiagramType.AnnualHeatProfile)
                        {
                            submissionResult["desnz_annualheatprofilecomments"] = data.commentValue;
                        }
                        else if (data.diagramType == (int)Submission.DiagramType.DailyHeatProfile)
                        {
                            submissionResult["desnz_dailyheatprofilecomments"] = data.commentValue;
                        }
                        else if (data.diagramType == (int)Submission.DiagramType.HeatLoadDurationCurve)
                        {
                            submissionResult["desnz_heatloaddurationcurvecomments"] = data.commentValue;
                        }
                        else if (data.diagramType == (int)Submission.DiagramType.ReturnToAssessor)
                        {
                            submissionResult["desnz_rpcomments"] = data.commentValue;
                        }
                        else
                        {
                            reply.message = "Not Valid Diagram Type";
                            return StatusCode(StatusCodes.Status400BadRequest, reply);
                        }
                        await serviceClient.UpdateAsync(submissionResult);
                        return Ok(data.submissionId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Error in CreateCommentForSection API service call";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }

        public class RequestComment
        {
            [Required]
            public string? submissionId { get; set; }    // desnz_submissionid
            [Required]
            [Range((int)Submission.DiagramType.SchemeEnergyFlowDiagram, (int)Submission.DiagramType.HeatLoadDurationCurve)]
            public int diagramType { get; set; }
            public string? commentValue { get; set; }

           
        }
    }
}

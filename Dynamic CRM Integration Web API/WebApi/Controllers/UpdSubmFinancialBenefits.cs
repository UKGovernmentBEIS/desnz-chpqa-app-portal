using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdSubmFinancialBenefits : ControllerBase
    {
        private readonly ILogger<UpdSubmFinancialBenefits> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmFinancialBenefits(ILogger<UpdSubmFinancialBenefits> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update Submission FinancialBenefits with the given data.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("UpdSubmFinancialBenefits")]
        [SwaggerOperation(Summary = "Update Submission Financial Benefits.", Description = "Update Submission FinancialBenefits with the given data.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> SubmFinancialBenefits(RequestUpdSubmFinancialBenefits data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.idSubmission, serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    RequestReturnId returnId = new RequestReturnId();

                    if (data == null)
                    {
                        reply.message = "data is null";
                        return BadRequest(reply);
                    }

                    Entity resultSubmission = new Entity("desnz_submission", data.idSubmission ?? Guid.Empty);       // get submission

                    resultSubmission["desnz_annualclimatechangelevyamount"] = data.annualClimateChangeLevyAmount ?? null;
                    resultSubmission["desnz_annualcarbonpricesupportamount"] = data.annualCarbonPriceSupportAmount ?? null;
                    resultSubmission["desnz_annualrenewableheatincentiveupliftamount"] = data.annualRenewableHeatIncentiveUpliftAmount ?? null;
                    resultSubmission["desnz_annualrenewablesobligrationcertificateamount"] = data.annualRenewablesObligationCertificateAmount ?? null;
                    resultSubmission["desnz_annualcontractsfordifferenceamount"] = data.annualContractsForDifferenceAmount ?? null;
                    resultSubmission["desnz_annualbusinessratesreductionamount"] = data.annualBusinessRatesReductionAmount ?? null;

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.ProvideInformationFinancialBenefits, (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);

                    _logger.LogInformation("Updated Submission with a choice (yes/no) in required a Secretary of State exemption certificate question at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

                    returnId.id = resultSubmission.Id;
                    return Ok(returnId.id);
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

        public class RequestUpdSubmFinancialBenefits
        {
            [Required] public Guid? idSubmission { get; set; }

            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? annualClimateChangeLevyAmount { get; set; }         // desnz_annualclimatechangelevyamount

            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? annualCarbonPriceSupportAmount { get; set; }         // desnz_annualcarbonpricesupportamount
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? annualRenewableHeatIncentiveUpliftAmount { get; set; }         // desnz_annualrenewableheatincentiveupliftamount
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? annualRenewablesObligationCertificateAmount { get; set; }         // desnz_annualrenewablesobligationcertificateamount
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? annualContractsForDifferenceAmount { get; set; }         // desnz_annualcontractsfordifferenceamount
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? annualBusinessRatesReductionAmount { get; set; }         // desnz_annualbusinessratesreductionamount

        }
    }
}

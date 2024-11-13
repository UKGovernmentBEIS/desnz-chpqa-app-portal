using Microsoft.AspNetCore.Mvc;
using Microsoft.Crm.Sdk.Messages;
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
    public class DownloadCertificateFile : ControllerBase
    {
        private readonly ILogger<DownloadCertificateFile> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public DownloadCertificateFile(ILogger<DownloadCertificateFile> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Returns a file as byte array in body and attributes like filename, lenght etc in header of the response
        ///
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <response code="200">Returns the byte array of the file</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(FileContentResult), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("DownloadCertificateFile")]
        [SwaggerOperation(Summary = "Download File For Submission via File ID", Description = "Download File For Submission via File ID")]
        public async Task<IActionResult> DownloadCertificateFiles([FromQuery, Required] Guid idSubmission, [FromQuery, Required] Guid idFile)
        {
            try
            {

                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    Entity fileResult = await serviceClient.RetrieveAsync("desnz_certificationfiles", idFile, new ColumnSet("desnz_certificationfilesid", "desnz_submission"));

                    if (fileResult == null)
                    {
                        reply.message = "Wrong file id";
                        return BadRequest(reply);
                    }

                    EntityReference submissionEntityRef = null;

                    // get submission reference
                    if (fileResult.Attributes.Contains("desnz_submission") && fileResult["desnz_submission"] != null)
                    {
                        submissionEntityRef = fileResult["desnz_submission"] as EntityReference;
                    }

                    Guid submissionIdFromFileEntity = submissionEntityRef == null ? Guid.Empty : submissionEntityRef.Id;


                    if (submissionIdFromFileEntity != idSubmission)
                    {
                        reply.message = "Submission Id of file is not the same as the submission id given.";
                        return Unauthorized(reply);
                    }


                    // Initialize the file download
                    var initializeFileBlocksDownloadRequest = new InitializeFileBlocksDownloadRequest
                    {
                        Target = new EntityReference("desnz_certificationfiles", fileResult.GetAttributeValue<Guid>("desnz_certificationfilesid")),
                        FileAttributeName = "desnz_file"
                    };

                    var initializeFileBlocksDownloadResponse = (InitializeFileBlocksDownloadResponse)serviceClient.Execute(initializeFileBlocksDownloadRequest);

                    // Download the file blocks
                    var downloadBlockRequest = new DownloadBlockRequest
                    {
                        FileContinuationToken = initializeFileBlocksDownloadResponse.FileContinuationToken
                    };

                    var downloadBlockResponse = (DownloadBlockResponse)serviceClient.Execute(downloadBlockRequest);

                    if (downloadBlockResponse.Data == null) // Customize this based on actual exception details
                    {
                        reply.message = "Internal Server Error Occurred";
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }

                    return File(downloadBlockResponse.Data, GetMimeType(initializeFileBlocksDownloadResponse.FileName), initializeFileBlocksDownloadResponse.FileName);

                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = ex.Message;
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }


        private string GetMimeType(string fileName)
        {
            string extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                // Text files
                ".txt" => "text/plain",

                // PDF files
                ".pdf" => "application/pdf",

                // Word documents
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

                // Excel spreadsheets
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                // PowerPoint presentations
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",

                // Visio diagrams
                ".vsd" => "application/vnd.visio",
                ".vsdx" => "application/vnd.ms-visio.drawing",

                // Image formats
                ".jpeg" => "image/jpeg",
                ".jpg" => "image/jpeg",
                ".png" => "image/png",
                ".tiff" => "image/tiff",

                // Default MIME type for unknown file extensions
                _ => "application/octet-stream",
            };
        }
    }
}

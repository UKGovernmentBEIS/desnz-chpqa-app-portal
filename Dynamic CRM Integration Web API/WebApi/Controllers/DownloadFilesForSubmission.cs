using Microsoft.AspNetCore.Mvc;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class DownloadFilesForSubmission : ControllerBase
    {
        private readonly ILogger<DownloadFilesForSubmission> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public DownloadFilesForSubmission(ILogger<DownloadFilesForSubmission> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpGet("DownloadFilesForSubmission")]
        [SwaggerOperation(Summary = "Download Files For Submission", Description = "Download Files For Submission")]
        public async Task<ActionResult<List<FileWithComment>>> DownloadFilesSubmission(Guid idSubmission, int? diagramType)
        {
            try
            {
                var filesWithComments = new List<FileWithComment>();

                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                  
                    // Construct the query to fetch the related entities
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_submissiondiagramsfiles",
                        ColumnSet = new ColumnSet("desnz_submissiondiagramsfilesid", "desnz_comments"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission),
                                new ConditionExpression("desnz_diagramtype", ConditionOperator.Equal, diagramType)
                            }
                        }
                    };

                    // Retrieve the related entities
                    EntityCollection relatedModelResults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    // Process each related entity
                    foreach (Entity entity in relatedModelResults.Entities)
                    {
                        // Initialize the file download
                        var initializeFileBlocksDownloadRequest = new InitializeFileBlocksDownloadRequest
                        {
                            Target = new EntityReference("desnz_submissiondiagramsfiles", entity.GetAttributeValue<Guid>("desnz_submissiondiagramsfilesid")),
                            FileAttributeName = "desnz_file"
                        };

                        var initializeFileBlocksDownloadResponse = (InitializeFileBlocksDownloadResponse)serviceClient.Execute(initializeFileBlocksDownloadRequest);

                        // Download the file blocks
                        var downloadBlockRequest = new DownloadBlockRequest
                        {
                            FileContinuationToken = initializeFileBlocksDownloadResponse.FileContinuationToken
                        };

                        var downloadBlockResponse = (DownloadBlockResponse)serviceClient.Execute(downloadBlockRequest);

                        // Convert the file data to a MemoryStream for IFormFile
                        using var memoryStream = new MemoryStream(downloadBlockResponse.Data);
                        IFormFile formFile = new FormFile(memoryStream, 0, memoryStream.Length, "desnz_file", initializeFileBlocksDownloadResponse.FileName)
                        {
                            Headers = new HeaderDictionary(),
                            ContentType = GetMimeType(initializeFileBlocksDownloadResponse.FileName)
                        };

                        // Add the file and its comment to the list
                        filesWithComments.Add(new FileWithComment
                        {
                            File = formFile,
                            Comment = entity.GetAttributeValue<string>("desnz_comments")
                        });
                    }
                }

                // Return the list of files with their comments
                return Ok(filesWithComments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error Occurred");
            }
        }

        // Define the FileWithComment class
        public class FileWithComment
        {
            public IFormFile File { get; set; }
            public string Comment { get; set; }
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

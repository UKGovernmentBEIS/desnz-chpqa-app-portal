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
    [Route("api/secure")]
    [ApiController]
    public class DownloadEquipMeterFile : ControllerBase
    {
        private readonly ILogger<DownloadEquipMeterFile> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public DownloadEquipMeterFile(ILogger<DownloadEquipMeterFile> logger, IServiceClientFactory serviceClientFactory)
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
        [HttpGet("DownloadEquipMeterFile")]
        [SwaggerOperation(Summary = "Download a File for Equipment of Meter entity", Description = "Download a File for Equipment of Meter entity")]
        
        public async Task<IActionResult> DownloadEquipMeterFileFun(
            [FromQuery, Required] Guid idSubmission, 
            [FromQuery, Required] Guid idFile, 
            [FromQuery, Required, Range((int)EquipmentMeterFileEntityType.EntityType.Equipment, (int)EquipmentMeterFileEntityType.EntityType.Meter)] int entityType)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                 
                    ReplyMessage reply = new ReplyMessage();

                    string entityName = "";
                    string entityId = "";
                    string entityReference = "";
                    string entityLinkToEntityName = "";
                    string entityLinkToAttributeName = "";
                    string linkEntityAlias = "";

                    if (entityType == (int)EquipmentMeterFileEntityType.EntityType.Equipment)
                    {
                        // Set strings for equipment
                        entityName = "desnz_equipmentfiles";
                        entityId = "desnz_equipmentfilesid";
                        entityReference = "desnz_equipment";
                        entityLinkToEntityName = "desnz_primemovers";
                        entityLinkToAttributeName = "desnz_primemoversid";
                        linkEntityAlias = "Equipment";

                    }
                    else if (entityType == (int)EquipmentMeterFileEntityType.EntityType.Meter)
                    {
                        // Set strings for meter
                        entityName = "desnz_meterfiles";
                        entityId = "desnz_meterfilesid";
                        entityReference = "desnz_meter";
                        entityLinkToEntityName = "desnz_fuelmeters";
                        entityLinkToAttributeName = "desnz_fuelmetersid";
                        linkEntityAlias = "Meter";
                    }
                    else
                    {
                        reply.message = "Wrong input for field: entityType";
                        return BadRequest(reply);
                    }

                    QueryExpression fileQuery = new QueryExpression
                    {
                        EntityName = entityName, // Specify the name of the parent entity
                        ColumnSet = new ColumnSet(entityId, "desnz_name", "desnz_file", "desnz_type", entityReference),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression(entityId, ConditionOperator.Equal, idFile)
                            }
                        },
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = entityName, // Parent entity
                                LinkFromAttributeName = entityReference, // Parent entity attribute
                                LinkToEntityName = entityLinkToEntityName, // Related entity
                                LinkToAttributeName = entityLinkToAttributeName, // Related entity attribute
                                Columns = new ColumnSet(entityLinkToAttributeName, "desnz_name", "desnz_submission"),
                                EntityAlias = linkEntityAlias, // Alias for the related entity
                            }
                        }
                    };

                    // Execute the QueryExpression to retrieve multiple records
                    EntityCollection fileResults = await serviceClient.RetrieveMultipleAsync(fileQuery);

                    // Construct the query to fetch the related entities
                    //Entity fileEnitity = await serviceClient.RetrieveAsync(entityName, idFile, new ColumnSet(entityId, "desnz_name", "desnz_file", "desnz_type", entityReference));


                    if (fileResults.Entities.Count <= 0)
                    {
                        reply.message = "Wrong file id";
                        return BadRequest(reply);
                    }

                    

                    EntityReference submissionEntityRef = null;

                    // get submission reference
                    AliasedValue linkedEntitySubmissionId = null;
                    if (fileResults.Entities[0].Attributes.ContainsKey(linkEntityAlias + ".desnz_submission"))
                    {
                        linkedEntitySubmissionId = (AliasedValue)fileResults.Entities[0][linkEntityAlias + ".desnz_submission"];
                    }
                    //Guid submissionIdFromFileEntity = linkedEntitySubmissionId.Value == null ? Guid.Empty : (Guid)linkedEntitySubmissionId.Value;
                    Guid submissionIdFromFileEntity = Guid.Empty;

                    // Check if the value is an EntityReference and get the Id from it
                    if (linkedEntitySubmissionId?.Value is EntityReference entityReferenceSubm)
                    {
                        submissionIdFromFileEntity = entityReferenceSubm.Id;
                    }
                    




                    if (submissionIdFromFileEntity != idSubmission)
                    {
                        reply.message = "Submission Id of file is not the same as the submission id given.";
                        return Unauthorized(reply);
                    }

                    // Initialize the file download
                    var initializeFileBlocksDownloadRequest = new InitializeFileBlocksDownloadRequest
                    {
                        Target = new EntityReference(entityName, fileResults.Entities[0].GetAttributeValue<Guid>(entityId)),
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
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }

        // Define the FileWithComment class
        public class EquipmentMeterFileEntityType
        {
            public enum EntityType
            {
                Equipment = 0,
                Meter = 1
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

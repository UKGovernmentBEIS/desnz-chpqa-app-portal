using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using nClam;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;
using static WebApi.Controllers.UploadFiles.CreateFile;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UploadFiles : ControllerBase
    {
        private readonly ILogger<UploadFiles> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly ClamAVScanner _clamAVScanner;

        private const long MaxFileSize = 50 * 1024 * 1024; 

        private const int MaxFileCount = 25;
        public UploadFiles(ILogger<UploadFiles> logger, IServiceClientFactory serviceClientFactory, ClamAVScanner clamAVScanner)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
            _clamAVScanner = clamAVScanner;
        }
        [HttpPost("UploadFiles")]
        public async Task<ActionResult<RequestReturnId>> UploadFilesToEntity(CreateFile data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    if (data.file == null || data.file.Length == 0)
                    {
                        reply.message = "No file uploaded.";
                        return BadRequest(reply);
                    }

                    if (data.fileName.Length > (int)SubmissionDiagramsFiles.FileAttribute.lenght)
                    {
                        reply.message = "File name too long, above " + (int)SubmissionDiagramsFiles.FileAttribute.lenght + ".";
                        return BadRequest(reply);
                    }

                    var fileExtension = Path.GetExtension(data.file.FileName).ToLowerInvariant();
                    var allowedExtensions = new HashSet<string>
                    {
                        ".doc", ".docx", // Word
                        ".xls", ".xlsx", // Excel
                        ".ppt", ".pptx", // PowerPoint
                        ".vsd", ".vsdx", // Visio
                        ".jpeg", ".jpg", ".png", ".tiff", // Image formats
                        ".pdf", // PDF
                        ".txt" // Text
                    };

                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        reply = new ReplyMessage();
                        reply.message = "Invalid file format. Please upload a valid file.";
                        return StatusCode(StatusCodes.Status400BadRequest, reply);                       
                    }

                    // Check if the file exceeds the maximum size
                    if (data.file.Length > MaxFileSize)
                    {
                        reply.message = "The file size exceeds the 50 MB limit.";
                        return BadRequest(reply);
                    }


                    QueryExpression query = new QueryExpression
                    {
                        EntityName = data.entity, // Specify the name of the parent entity
                        ColumnSet = new ColumnSet(data.attributeName),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression(data.parentAttributeName, ConditionOperator.Equal, data.entityId)
                            }
                        }
                    };
                    // if diagram type is not null we should check for each type else if digram type is null, like
                    // in case of equipment or meter file we will have a different entity name so the count check is valid
                    if (data.diagramType != null)
                    {
                        query.Criteria.AddCondition(new ConditionExpression("desnz_diagramtype", ConditionOperator.Equal, data.diagramType));
                    }

                    EntityCollection result = await serviceClient.RetrieveMultipleAsync(query);

                    if (result.Entities.Count < MaxFileCount)
                    {                                            
                        byte[] fileBytes;
                        using (var memoryStream = new MemoryStream())
                        {
                            await data.file.CopyToAsync(memoryStream);
                            fileBytes = memoryStream.ToArray();
                        }

                        if (!await _clamAVScanner.ScanFileAsync(fileBytes, User))
                        {
                            reply = new ReplyMessage();
                            reply.message = "Internal Server Error Occurred";
                            return StatusCode(StatusCodes.Status500InternalServerError, reply);
                        }

                        Entity FileEntity = new(data.entity);

                        FileEntity["desnz_name"] = data.fileName;
                        FileEntity["desnz_type"] = data.mimeType;

                        if (data.diagramType != null)
                        {
                            FileEntity["desnz_diagramtype"] = new OptionSetValue((int)data.diagramType);
                            FileEntity["desnz_comments"] = data.comments;
                        }

                        FileEntity[data.parentAttributeName] = new EntityReference(data.parentEntity, data.entityId);

                        FileEntity.Id = await serviceClient.CreateAsync(FileEntity);

                        UploadFile.UploadFileToDynamics365(serviceClient, fileBytes, new EntityReference(data.entity, FileEntity.Id), data.attributeName, data.fileName, data.mimeType);

                        /*if (data?.groupId != null)
                        {
                            Entity submissionGroup = new("desnz_group", data?.groupId ?? Guid.Empty);

                            submissionGroup["desnz_status"] = new OptionSetValue(data?.groupStatus ?? 0);

                            await serviceClient.UpdateAsync(submissionGroup);
                        }*/

                        if (Enum.IsDefined(typeof(MainDiagramTypeWithStatus), data.diagramType ?? -1))
                        {

                            int groupType = 0;

                            switch (data.diagramType)
                            {
                                case (int)MainDiagramTypeWithStatus.SchemeEnergyFlowDiagram:
                                    groupType = (int)SubmissionGroups.GroupType.UploadEnergyFlowDiagram;
                                    break;
                                case (int)MainDiagramTypeWithStatus.SchemeLineDiagram:
                                    groupType = (int)SubmissionGroups.GroupType.UploadSchemeLineDiagram;
                                    break;
                                case (int)MainDiagramTypeWithStatus.AnnualHeatProfile:
                                    groupType = (int)SubmissionGroups.GroupType.UploadAnnualHeatProfile;
                                    break;
                                case (int)MainDiagramTypeWithStatus.DailyHeatProfile:
                                    groupType = (int)SubmissionGroups.GroupType.UploadDailyHeatProfile;
                                    break;
                                case (int)MainDiagramTypeWithStatus.HeatLoadDurationCurve:
                                    groupType = (int)SubmissionGroups.GroupType.UploadHeatLoadDurationCurve;
                                    break;
                                default:
                                    groupType = -1;
                                    break;
                            }
                            if(groupType != -1)
                            {
                                // update submission group status and check to unlock next goups
                                await UpdSectionStatusesFun.ChangeSectionStatuses(data.entityId, groupType, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger);
                            }
                        }


                        _logger.LogInformation("New File created with id :  {id}", FileEntity.Id.ToString());

                        RequestReturnId returnId = new RequestReturnId();
                        returnId.id = FileEntity.Id;

                        return Ok(returnId.id);
                    }
                    else {
                        reply = new ReplyMessage();
                        reply.message = "The maximum file number has been exceeded.";
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }
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

        public class CreateFile
        {
            [Required]
            public Guid? idSubmission { get; set; }
            public IFormFile file { get; set; }       
            public string? entity { get; set; }
            public string? attributeName { get; set; }
            public string? parentEntity { get; set; }
            public string? parentAttributeName { get; set; }
            public string? fileName { get; set; }
            public int? diagramType { get; set; }
            public string? mimeType { get; set; }
            public Guid entityId { get; set; }
            //public Guid? groupId { get; set; }
            //public int? groupStatus { get; set; }
            public string? comments { get; set; }

           
            public enum MainDiagramTypeWithStatus
            {
                SchemeEnergyFlowDiagram = Submission.DiagramType.SchemeEnergyFlowDiagram,
                SchemeLineDiagram = Submission.DiagramType.SchemeLineDiagram,
                AnnualHeatProfile = Submission.DiagramType.AnnualHeatProfile,
                DailyHeatProfile = Submission.DiagramType.DailyHeatProfile,
                HeatLoadDurationCurve = Submission.DiagramType.HeatLoadDurationCurve
            }

        }
    }
}

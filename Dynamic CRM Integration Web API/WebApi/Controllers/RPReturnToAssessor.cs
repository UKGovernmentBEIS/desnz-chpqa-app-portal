using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class RPReturnToAssessor : ControllerBase
    {
        private readonly ILogger<RPReturnToAssessor> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly ClamAVScanner _clamAVScanner;
        private readonly IConfiguration _configuration;

        private const long MaxFileSize = 50 * 1024 * 1024;

        private const int MaxFileCount = 25;
        public RPReturnToAssessor(ILogger<RPReturnToAssessor> logger, IServiceClientFactory serviceClientFactory, ClamAVScanner clamAVScanner, IConfiguration configuration)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
            _clamAVScanner = clamAVScanner;
            _configuration = configuration;

        }
        [HttpPost("RPReturnToAssessor")]
        public async Task<ActionResult<RequestReturnId>> RPToAssessor([FromForm] RPToAssessorClass data)
        {
            try
            {
                string entity = "desnz_submissiondiagramsfiles";
                string attributeName = "desnz_file";
                string parentAttributeName = "desnz_submission";
                string parentEntity = "desnz_submission";

                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    //
                    int userRole = await GetUserRoleFun.GetRoleOfUser(User, serviceClient);
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.Submissionid, serviceClient, _logger, userRole))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    foreach (RpFiles rpfile in data.Files)
                    {
                        if (rpfile.file == null || rpfile.file.Length == 0)
                        {
                            reply.message = "No file uploaded.";
                            return BadRequest(reply);
                        }

                        if (rpfile.fileName.Length > (int)SubmissionDiagramsFiles.FileAttribute.lenght)
                        {
                            reply.message = "File name too long, above " + (int)SubmissionDiagramsFiles.FileAttribute.lenght + ".";
                            return BadRequest(reply);
                        }

                        var fileExtension = Path.GetExtension(rpfile.file.FileName).ToLowerInvariant();
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
                        if (rpfile.file.Length > MaxFileSize)
                        {
                            reply.message = "The file size exceeds the 50 MB limit.";
                            return BadRequest(reply);
                        }

                    }
                    QueryExpression query = new QueryExpression
                    {
                        EntityName = entity, // Specify the name of the parent entity
                        ColumnSet = new ColumnSet(attributeName),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                                {
                                    new ConditionExpression(parentAttributeName, ConditionOperator.Equal, data.Submissionid),
                                    new ConditionExpression("desnz_diagramtype", ConditionOperator.Equal, (int)Submission.DiagramType.ReturnToAssessor)
                                }
                        }
                    };

                    EntityCollection result = await serviceClient.RetrieveMultipleAsync(query);

                    if (result.Entities.Count < MaxFileCount)
                    {
                        foreach (RpFiles rpfile in data.Files)
                        {
                            byte[] fileBytes;
                            using (var memoryStream = new MemoryStream())
                            {
                                await rpfile.file.CopyToAsync(memoryStream);
                                fileBytes = memoryStream.ToArray();
                            }

                            if (!await _clamAVScanner.ScanFileAsync(fileBytes, User))
                            {
                                reply = new ReplyMessage();
                                reply.message = "Internal Server Error Occurred";
                                return StatusCode(StatusCodes.Status500InternalServerError, reply);
                            }

                            Entity FileEntity = new(entity);

                            FileEntity["desnz_name"] = rpfile.fileName;
                            FileEntity["desnz_type"] = rpfile.mimeType;

                            FileEntity["desnz_diagramtype"] = new OptionSetValue((int)Submission.DiagramType.ReturnToAssessor);

                            FileEntity[parentAttributeName] = new EntityReference(parentEntity, data.Submissionid);

                            FileEntity.Id = await serviceClient.CreateAsync(FileEntity);

                            UploadFile.UploadFileToDynamics365(serviceClient, fileBytes, new EntityReference(entity, FileEntity.Id), attributeName, rpfile.fileName, rpfile.mimeType);

                            // update submission group status and check to unlock next goups
                            //await UpdSectionStatusesFun.ChangeSectionStatuses(data.entityId, groupType, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger);

                            _logger.LogInformation("New File created with id :  {id}", FileEntity.Id.ToString());

                        }

                        //GET ALL DATA FOR COMMENT & EMAIL

                        //1) Get RP (current User)
                        var (RP, schemeName, schemeReference) = await HelperFunctions.GetSchemeAndContactInfoAsync(serviceClient, data.Submissionid, true);

                        //Fetch Comments Table - Get latest comment from an Assessor (TA1 or AS.ADMIN comment)
                        //Assessor Roles we need for Query
                        int[] assessorRoles = { (int)Person.UserType.TechnicalAssessor, (int)Person.UserType.AssessorAdmin };

                        QueryExpression commentsQuery = new QueryExpression
                        {
                            EntityName = "desnz_rpassessorcomment",
                            ColumnSet = new ColumnSet("desnz_rpassessorcommentid", "desnz_sender", "desnz_senderusertype"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                    {
                                        new ConditionExpression("desnz_submission", ConditionOperator.Equal, data.Submissionid),
                                        new ConditionExpression("desnz_senderusertype", ConditionOperator.In, assessorRoles)
                                    }
                            },
                            LinkEntities =
                            {
                                new LinkEntity
                                {
                                    JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                    LinkFromEntityName = "desnz_rpassessorcomment", // Parent entity
                                    LinkFromAttributeName = "desnz_sender", // Parent entity attribute
                                    LinkToEntityName = "contact", // Related entity
                                    LinkToAttributeName = "contactid", // Related entity attribute
                                    Columns = new ColumnSet("contactid", "firstname", "lastname","desnz_usertype"),
                                    EntityAlias = "Assessor"
                                }
                            },
                            TopCount = 1 // Limit the result to only one record
                        };

                        //Get latest Assessor (TA1 or AS.ADMIN) comment for this submission first
                        commentsQuery.AddOrder("createdon", OrderType.Descending);

                        //Gives 1 (LATEST) comment from an Assessor (TA1 OR AS.ADMIN)
                        EntityCollection commentsResults = await serviceClient.RetrieveMultipleAsync(commentsQuery);

                        if (commentsResults.Entities.Count > 0)
                        {
                            Person sender = new Person();
                            if (commentsResults.Entities[0].Attributes.ContainsKey("desnz_sender"))
                            {
                                // Fetch Assessor information
                                AliasedValue assessorID = commentsResults.Entities[0].GetAttributeValue<AliasedValue>("Assessor.contactid");
                                AliasedValue assessorFirstName = commentsResults.Entities[0].GetAttributeValue<AliasedValue>("Assessor.firstname");
                                AliasedValue assessorLastName = commentsResults.Entities[0].GetAttributeValue<AliasedValue>("Assessor.lastname");
                                AliasedValue assessorUserType = commentsResults.Entities[0].GetAttributeValue<AliasedValue>("Assessor.desnz_usertype");

                                //Last Assessor Sender
                                sender.id = new Guid(assessorID.Value.ToString());
                                sender.firstName = assessorFirstName?.Value.ToString();
                                sender.lastName = assessorLastName?.Value.ToString();
                                sender.userType = ((OptionSetValue)assessorUserType?.Value).Value;
                            }

                            //Create new COMMENT Entity and post comment
                            Entity commentEntity = new Entity("desnz_rpassessorcomment");
                            commentEntity["desnz_comment"] = data.comments;
                            commentEntity["desnz_sender"] = new EntityReference("contact", RP.id ?? Guid.Empty);
                            commentEntity["desnz_receiver"] = new EntityReference("contact", sender.id ?? Guid.Empty); //Last assessor to send a message so he is now the receiver
                            commentEntity["desnz_senderusertype"] = new OptionSetValue((int)sender.userType);
                            commentEntity["desnz_submission"] = new EntityReference("desnz_submission", data.Submissionid);
                            await serviceClient.CreateAsync(commentEntity);

                            //Function to change Scheme Status to Unassigned after RP Sends it
                            await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.Submissionid, (int)Submission.SubmissionStatus.Unassinged, serviceClient, _logger);

                            //Function to complete the group
                            await UpdSectionStatusesFun.ChangeSectionStatuses(data.Submissionid, (int)SubmissionGroups.GroupType.ReturnToAssessor, (int)SubmissionGroups.GroupCategory.ReturnToAssessor, serviceClient, _logger);


                            //Send Email
                            SendEmail emailProxy = new SendEmail(_configuration);

                            string fullname = RP.firstName + " " + RP.lastName;
                            string assessorFullname = sender.firstName + " " + sender.lastName;

                            SendEmailRPReturnToAssessor task = new SendEmailRPReturnToAssessor(_configuration);

                            bool Output = false;

                            if (RP.email != null)
                            {
                                Output = await task.SendEmailReturnToAssessor(fullname, schemeName, schemeReference, assessorFullname, RP.email, data.comments);
                            }

                            if (Output) { return Ok(data.Submissionid); }
                            else
                            {
                                reply.message = "Internal Server Error";
                                return StatusCode(StatusCodes.Status500InternalServerError, reply);
                            }
                        } else
                        {
                            reply.message = "Internal Server Error";
                            return StatusCode(StatusCodes.Status500InternalServerError, reply);
                        }
                        //POSTED COMMENT & SENT EMAIL - DONE
                    }
                    else
                    {
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

        public class RPToAssessorClass
        {
            public List<RpFiles> Files { get; set; } = new List<RpFiles>();
            [Required]
            public Guid Submissionid { get; set; }
            public string? comments { get; set; }
        }
        public class RpFiles
        {
            public IFormFile file { get; set; }
            public string? fileName { get; set; }
            public string? mimeType { get; set; }
        }
    }
}


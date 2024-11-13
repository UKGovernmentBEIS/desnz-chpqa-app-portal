using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Text;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class ValidateImportf4s : ControllerBase
    {
        private readonly ILogger<ValidateImportf4s> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public ValidateImportf4s(ILogger<ValidateImportf4s> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Validation of bulk Import of F4S file.
        /// </summary>
        /// <response code="200">If the file was validated successfully</response>
        /// <response code="400">If no file was validated or wrong type of file (different than ".xlsx" or "xls")</response>
        /// <response code="500">If a file with all cells empty was uploaded or If there is a server error</response>
        [ProducesResponseType(typeof(ReplyMessage), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("ValidateImportf4s")]
        public async Task<IActionResult> ValidateImportf4sExcel(ImportFile importdata)
        {
            try
            {
                ReplyMessage reply = new ReplyMessage();


                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    // check if user can upload a spreadsheet
                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(new Guid(importdata.SubmissionId), serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //
                    if (!await UpdSectionStatusesFun.SectionStatusesForBulkImport(new Guid(importdata.SubmissionId), serviceClient, _logger))
                    {
                        reply.message = "Cannot upload a file yet, Scheme Details and Scheme Capacity Details are not Completed.";
                        return BadRequest(reply);
                    }
                }

                if (importdata.file == null || importdata.file.Length == 0)
                {
                    reply.message = "No file uploaded.";
                    return StatusCode(StatusCodes.Status400BadRequest, reply);
                }

                var fileExtension = Path.GetExtension(importdata.file.FileName);
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    reply.message = "Invalid file format. Please upload an Excel file.";
                    return StatusCode(StatusCodes.Status400BadRequest, reply);
                }
         
                byte[] fileBytes;
                var data = new List<f4sModel>();
                var validationErrors = new StringBuilder();

                using (var memoryStream = new MemoryStream())
                {
                    await importdata.file.CopyToAsync(memoryStream);
                    fileBytes = memoryStream.ToArray();

                    using (var workbook = new XLWorkbook(memoryStream))
                    {
                        var sheet = workbook.Worksheet(2);

                        var headerRow = sheet.Row(1);
                        bool isHeaderRowEmpty = headerRow.Cells().All(cell => cell.IsEmpty());

                        if (isHeaderRowEmpty)
                        {
                            reply.message = "Header row is empty. Please provide a valid header row.";
                            return StatusCode(StatusCodes.Status400BadRequest, reply);
                        }

                        var firstDataRow = sheet.Row(2);
                        bool isFirstDataRowEmpty = firstDataRow.Cells().All(cell => cell.IsEmpty());

                        if (isFirstDataRowEmpty)
                        {
                            reply.message = "The first data row is empty. Please provide valid data.";
                            return StatusCode(StatusCodes.Status400BadRequest, reply);
                        }

                        // Get column information
                        var columnInfo = sheet.Row(1).Cells().Select((cell, index) => new
                        {
                            Index = index + 1,
                            ColumnName = cell.GetValue<string>()
                        }).ToList();

                        // Iterate through the rows
                        foreach (var row in sheet.RowsUsed().Skip(1))
                        {
                            var record = new f4sModel();
                            foreach (var prop in typeof(f4sModel).GetProperties())
                            {
                                var colInfo = columnInfo.SingleOrDefault(c => string.Join("", c.ColumnName.Split(default(string[]), StringSplitOptions.RemoveEmptyEntries)) == prop.Name);
                                if (colInfo != null)
                                {
                                    var cell = row.Cell(colInfo.Index);
                                    var cellValue = cell.Value;

                                    if (!cell.IsEmpty())
                                    {
                                        Type t = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                                        object safeValue = null;

                                        try
                                        {
                                            if (t == typeof(int))
                                            {
                                                safeValue = cell.GetValue<int>();
                                            }
                                            else if (t == typeof(double))
                                            {
                                                safeValue = cell.GetValue<double>();
                                            }
                                            else if (t == typeof(decimal))
                                            {
                                                safeValue = cell.GetValue<decimal>();
                                            }
                                            else if (t == typeof(DateTime))
                                            {
                                                safeValue = cell.GetValue<DateTime>();
                                            }
                                            else if (t == typeof(bool))
                                            {
                                                var tempsafeValue = cell.GetValue<string>();
                                                if (tempsafeValue.ToUpper() == "YES") safeValue = true;
                                                else if (tempsafeValue.ToUpper() == "NO") safeValue = false;
                                            }
                                            else if (t == typeof(string))
                                            {
                                                safeValue = cell.GetValue<string>();
                                            }
                                            else
                                            {
                                                safeValue = Convert.ChangeType(cellValue, t);
                                            }

                                            prop.SetValue(record, safeValue, null);
                                        }
                                        catch (Exception ex)
                                        {
                                            validationErrors.AppendLine($"Error converting value '{cellValue}' to type '{t.Name}' for column '{prop.Name}' at row {row.RowNumber()}: {ex.Message}");
                                            _logger.LogError(ex.Message);

                                            CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                                            await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                                            reply = new ReplyMessage();
                                            reply.message = validationErrors.ToString();
                                            return StatusCode(StatusCodes.Status500InternalServerError, reply);

                                        }
                                    }
                                }
                            }

                            var validationResult = await ValidateF4sModel(record);
                            if (validationResult.IsValid)
                            {
                                data.Add(record);
                            }
                            else
                            {
                                validationErrors.AppendLine($"Validation failed for row {row.RowNumber()}: {validationResult.ErrorMessage}");
                                reply.message = validationErrors.ToString();
                                return StatusCode(StatusCodes.Status500InternalServerError, reply);
                            }
                        }
                    }
                }

                if (validationErrors.Length > 0)
                {
                    reply.message = validationErrors.ToString();
                    return StatusCode(StatusCodes.Status500InternalServerError, reply);

                }

                reply.message = "Validated Successfully";
                return Ok(reply);
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

        private async Task<ValidationResult> ValidateF4sModel(f4sModel model)
        {

            
            if (model.Totalhoursofoperation <= 0)
            {
                return ValidationResult.Invalid("Total hours of operation must be greater than zero.");
            }

          
            bool isFuelGroupFilled = !string.IsNullOrEmpty(model.Fuelcategory) ||
                                     !string.IsNullOrEmpty(model.Fueltype) ||
                                     model.ShoulditbeincludedinCHPQAcalculationsenergyinput!=null ||
                                     model.Annualtotalenergyinput > 0;

            if (isFuelGroupFilled)
            {
                if (string.IsNullOrEmpty(model.Fuelcategory))
                {
                    return ValidationResult.Invalid("Fuel category is required.");
                }
                if (string.IsNullOrEmpty(model.Fueltype))
                {
                    return ValidationResult.Invalid("Fuel type is required.");
                }
                if (model.ShoulditbeincludedinCHPQAcalculationsenergyinput == null)
                {
                    return ValidationResult.Invalid("Should it be included in CHPQA calculations energy input is required.");
                }
                if (model.Annualtotalenergyinput <= 0)
                {
                    return ValidationResult.Invalid("Annual total energy input must be greater than zero.");
                }
                // check if fuel type is not of this fuel category
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    if (!await ValidateBulkImportFun.ValidateFuelTypeFuelCategory(model.Fueltype, model.Fuelcategory, serviceClient, _logger))
                    {
                        return ValidationResult.Invalid("Fuel type is not of this Fuel category.");
                    }
                }
            }

           
            bool isPowerGroupFilled = !string.IsNullOrEmpty(model.Powertype) ||
                                      model.ShoulditbeincludedinCHPQAcalculationspoweroutputs != null ||
                                      model.Annualtotalpoweroutputs > 0;

            if (isPowerGroupFilled)
            {
                if (string.IsNullOrEmpty(model.Powertype))
                {
                    return ValidationResult.Invalid("Power type is required.");
                }
                if (model.ShoulditbeincludedinCHPQAcalculationspoweroutputs == null)
                {
                    return ValidationResult.Invalid("Should it be included in CHPQA calculations power outputs is required.");
                }
                if (model.Annualtotalpoweroutputs <= 0)
                {
                    return ValidationResult.Invalid("Annual total power outputs must be greater than zero.");
                }
            }

          
            bool isHeatGroupFilled = !string.IsNullOrEmpty(model.Heattype) ||
                                    model.ShoulditbeincludedinCHPQAcalculationsheatoutputs != null ||
                                    model.Annualtotalofheatoutputs > 0;

            if (isHeatGroupFilled)
            {
                if (model.ShoulditbeincludedinCHPQAcalculationsheatoutputs == null)
                {
                    return ValidationResult.Invalid("Should it be included in CHPQA calculations heat outputs is required.");
                }
                if (string.IsNullOrEmpty(model.Heattype))
                {
                    return ValidationResult.Invalid("Heat type is required.");
                }
                if (model.Annualtotalofheatoutputs <= 0)
                {
                    return ValidationResult.Invalid("Annual total of heat outputs must be greater than zero.");
                }
            }

            if (!isFuelGroupFilled && !isPowerGroupFilled && !isHeatGroupFilled)
            {
                return ValidationResult.Invalid("At least one of Fuel, Heat or Power type is required.");
            }

            if (model.NeedaSOScertificate == null)
            {
                return ValidationResult.Invalid("Need a SOS certificate is required.");
            }

            if (model.Annualtotalenergyinput < 0)
            {
                return ValidationResult.Invalid("Annual total energy input cannot be negative.");
            }

            if (model.Annualtotalpoweroutputs < 0)
            {
                return ValidationResult.Invalid("Annual total power outputs cannot be negative.");
            }

            if (model.Annualtotalofheatoutputs < 0)
            {
                return ValidationResult.Invalid("Annual total of heat outputs cannot be negative.");
            }

            if (model.AnnualCCLValue < 0)
            {
                return ValidationResult.Invalid("Annual CCL value cannot be negative.");
            }

            if (model.AnnualCPSvalue < 0)
            {
                return ValidationResult.Invalid("Annual CPS value cannot be negative.");
            }

            if (model.AnnualRHAUpliftvalue < 0)
            {
                return ValidationResult.Invalid("Annual RHA uplift value cannot be negative.");
            }

            if (model.AnnualROCUpliftvalue < 0)
            {
                return ValidationResult.Invalid("Annual ROC uplift value cannot be negative.");
            }

            if (model.AnnualCfDwithCHPvalue < 0)
            {
                return ValidationResult.Invalid("Annual CfD with CHP value cannot be negative.");
            }

            if (model.Annualbusinessratesreduction < 0)
            {
                return ValidationResult.Invalid("Annual business rates reduction cannot be negative.");
            }

            if (!string.IsNullOrEmpty(model.ClimateChangeAgreement) && model.ClimateChangeAgreement.Length > 500)
            {
                return ValidationResult.Invalid("Climate Change Agreement length cannot exceed 100 characters.");
            }

            return ValidationResult.Valid();
        }


        public class f4sModel
        {
            public decimal Totalhoursofoperation { get; set; }
            public string Fuelcategory { get; set; }
            public string Fueltype { get; set; }
            public bool? ShoulditbeincludedinCHPQAcalculationsenergyinput { get; set; }
            public decimal Annualtotalenergyinput { get; set; }
            public string Powertype { get; set; }
            public bool? ShoulditbeincludedinCHPQAcalculationspoweroutputs { get; set; }
            public decimal Annualtotalpoweroutputs { get; set; }
            public string Heattype { get; set; }
            public bool? ShoulditbeincludedinCHPQAcalculationsheatoutputs { get; set; }
            public decimal Annualtotalofheatoutputs { get; set; }
            public bool? NeedaSOScertificate { get; set; }
            public decimal AnnualCCLValue { get; set; }
            public string ClimateChangeAgreement { get; set; }
            public decimal AnnualCPSvalue { get; set; }
            public decimal AnnualRHAUpliftvalue { get; set; }
            public decimal AnnualROCUpliftvalue { get; set; }
            public decimal AnnualCfDwithCHPvalue { get; set; }
            public decimal Annualbusinessratesreduction { get; set; }
        }

        public class ImportFile
        {
            [Required]
            public IFormFile file { get; set; }
            [Required]
            public string? SubmissionId { get; set; }
        }

       

        private class ValidationResult
        {
            public bool IsValid { get; set; }
            public string ErrorMessage { get; set; }

            public static ValidationResult Valid()
            {
                return new ValidationResult { IsValid = true };
            }

            public static ValidationResult Invalid(string errorMessage)
            {
                return new ValidationResult { IsValid = false, ErrorMessage = errorMessage };
            }
        }
    }
}

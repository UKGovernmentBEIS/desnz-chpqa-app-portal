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
    public class ValidateImportf4c : ControllerBase
    {
        private readonly ILogger<ValidateImportf4c> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public ValidateImportf4c(ILogger<ValidateImportf4c> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Validation of bulk Import of F4C file.
        /// </summary>
        /// <response code="200">If the file was validated successfully</response>
        /// <response code="400">If no file was validated or wrong type of file (different than ".xlsx" or "xls")</response>
        /// <response code="500">If a file with all cells empty was uploaded or If there is a server error</response>
        [ProducesResponseType(typeof(ReplyMessage), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("ValidateImportf4c")]
        public async Task<ActionResult> ValidateImportf4cExcel(ImportFile importdata)
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
                    reply = new ReplyMessage();
                    reply.message = "No file uploaded.";
                    return StatusCode(StatusCodes.Status400BadRequest, reply);
                }

                var fileExtension = Path.GetExtension(importdata.file.FileName);
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    reply = new ReplyMessage();
                    reply.message = "Invalid file format. Please upload an Excel file.";
                    return StatusCode(StatusCodes.Status400BadRequest, reply);
                }

                byte[] fileBytes;
                var data = new List<f4cModel>();
                List<string?> importedMetTagNums = new List<string?>(); //TAGNUMBERS of IMPORTED meters (EXCEL)
                var validationErrors = new StringBuilder();
                bool isFirstFuelEntry = true;
                bool isFirstHeatEntry = true;
                bool isFirstEntry = true;


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
                            reply = new ReplyMessage();
                            reply.message = "Header row is empty. Please provide a valid header row.";
                            return StatusCode(StatusCodes.Status400BadRequest, reply);
                        }

                        var firstDataRow = sheet.Row(2);
                        bool isFirstDataRowEmpty = firstDataRow.Cells().All(cell => cell.IsEmpty());

                        if (isFirstDataRowEmpty)
                        {
                            reply = new ReplyMessage();
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
                            var record = new f4cModel();
                            foreach (var prop in typeof(f4cModel).GetProperties())
                            {
                                string Filter(string input) => new string(input.Where(char.IsLetterOrDigit).ToArray()).ToLower();
                                var colInfo = columnInfo.SingleOrDefault(c => Filter(c.ColumnName) == Filter(prop.Name));

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
                                            validationErrors.AppendLine("There is a data missmatch in the spreadsheet");
                                            _logger.LogError(ex.Message);
                                            CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                                            await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                                            reply.message = validationErrors.ToString();
                                            return StatusCode(StatusCodes.Status500InternalServerError, reply);

                                        }
                                    }
                                }
                            }

                            var validationResult = await ValidateF4cModel(record, isFirstEntry, isFirstFuelEntry, isFirstHeatEntry);
                            if (validationResult.IsValid)
                            {
                                data.Add(record);
                                importedMetTagNums.Add(record.MeterTagNumber);
                                if (isFirstFuelEntry && record.EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers > 0)
                                {
                                    isFirstFuelEntry = false;
                                }
                                if (isFirstHeatEntry && record.EstimatedTotalHeatOutputUsedInthePrimeMovers > 0)
                                {
                                    isFirstHeatEntry = false;
                                }
                                isFirstEntry = false;
                            }
                            else
                            {
                                validationErrors.AppendLine(validationResult.ErrorMessage);
                                reply = new ReplyMessage();
                                reply.message = validationErrors.ToString();
                                return StatusCode(StatusCodes.Status500InternalServerError, reply);
                            }
                        }
                    }
                }

                //Check for Tag Number Validation
                //List<f4cModel> importedMeters = data;
                //Make logic to check if EVERY metertagnumber in importedMeters list matches with tag numbers of submission

                // STEP 1 - Fetch Submission Meter List
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_fuelmeters", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_fuelmetersid", "desnz_name", "desnz_tagnum"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, importdata.SubmissionId )
                            }
                        }
                    };

                    EntityCollection relatedModelresults = await serviceClient.RetrieveMultipleAsync(relatedquery);
                    List<string?> submTagNums = new List<string?>(); // SUBMISSION METERS
                    // REMINDER -> || List<int?> importedMetTagNums = new List<int?>(); || IMPORTED METERS
                    foreach (Entity entity in relatedModelresults.Entities)
                    {
                        ReplyMeter meter = new ReplyMeter();

                        meter.id = entity.GetAttributeValue<Guid>("desnz_fuelmetersid");
                        meter.name = entity.GetAttributeValue<string>("desnz_name");
                        meter.tagNumber = entity.GetAttributeValue<string>("desnz_tagnum");
                        submTagNums.Add(meter.tagNumber);
                    }

                    bool allExist = importedMetTagNums.All(importedTag => submTagNums.Contains(importedTag));

                    if (!allExist)
                    {
                        validationErrors.AppendLine("There is a data missmatch in the spreadsheet");
                        _logger.LogError(validationErrors.ToString());
                        
                        reply.message = validationErrors.ToString();
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }


                    //

                    if (validationErrors.Length > 0)
                    {
                        
                        reply.message = validationErrors.ToString();
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);

                    }

                    reply.message = "Validated Successfully";
                    return Ok(reply);
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


        private async Task<ValidationResult> ValidateF4cModel(f4cModel model, bool isFirstEntry, bool isFirstFuelEntry, bool isFirstHeatEntry)
        {
            
            if (model.MeterTagNumber == null)
            {
                return ValidationResult.Invalid("The spreadsheet is missing data");
            }

            bool isFuelGroupFilled = !string.IsNullOrEmpty(model.FuelCategory) ||
                                     !string.IsNullOrEmpty(model.FuelType) ||
                                     (model.ShouldItBeIncludedInCHPQAcalculationsEnergyInputs.HasValue && model.ShouldItBeIncludedInCHPQAcalculationsEnergyInputs != null) ||
                                     model.EnergyInputsJanuary > 0 ||
                                     model.EnergyInputsFebruary > 0 ||
                                     model.EnergyInputsMarch > 0 ||
                                     model.EnergyInputsApril > 0 ||
                                     model.EnergyInputsMay > 0 ||
                                     model.EnergyInputsJune > 0 ||
                                     model.EnergyInputsJuly > 0 ||
                                     model.EnergyInputsAugust > 0 ||
                                     model.EnergyInputsSeptember > 0 ||
                                     model.EnergyInputsOctober > 0 ||
                                     model.EnergyInputsNovember > 0 ||
                                     model.EnergyInputsDecember > 0 ||
                                     model.EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers > 0 ||
                                     model.EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers > 0;


            if (isFuelGroupFilled)
            {
                if (string.IsNullOrEmpty(model.FuelCategory))
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if (string.IsNullOrEmpty(model.FuelType))
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if (!model.ShouldItBeIncludedInCHPQAcalculationsEnergyInputs.HasValue)
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if ((model.EnergyInputsJanuary <= 0 || model.EnergyInputsJanuary == null) &&
                    (model.EnergyInputsFebruary <= 0 || model.EnergyInputsFebruary == null) &&
                    (model.EnergyInputsMarch <= 0 || model.EnergyInputsMarch == null) &&
                    (model.EnergyInputsApril <= 0 || model.EnergyInputsApril == null) &&
                    (model.EnergyInputsMay <= 0 || model.EnergyInputsMay == null) &&
                    (model.EnergyInputsJune <= 0 || model.EnergyInputsJune == null) &&
                    (model.EnergyInputsJuly <= 0 || model.EnergyInputsJuly == null) &&
                    (model.EnergyInputsAugust <= 0 || model.EnergyInputsAugust == null) &&
                    (model.EnergyInputsSeptember <= 0 || model.EnergyInputsSeptember == null) &&
                    (model.EnergyInputsOctober <= 0 || model.EnergyInputsOctober == null) &&
                    (model.EnergyInputsNovember <= 0 || model.EnergyInputsNovember == null) &&
                    (model.EnergyInputsDecember <= 0 || model.EnergyInputsDecember == null))
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }

                if ((model.EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers <= 0) && isFirstFuelEntry)
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if ((model.EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers <= 0) && isFirstFuelEntry)
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                // check if fuel type is not of this fuel category
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    if (!await ValidateBulkImportFun.ValidateFuelTypeFuelCategory(model.FuelType, model.FuelCategory, serviceClient, _logger))
                    {
                        return ValidationResult.Invalid("Fuel type is not of this Fuel category.");
                    }
                }
            }

            bool isPowerGroupFilled = !string.IsNullOrEmpty(model.PowerType) ||
                                      (model.ShouldItBeIncludedInCHPQAcalculationsPowerOutputs.HasValue && model.ShouldItBeIncludedInCHPQAcalculationsPowerOutputs != null) ||
                                      model.PowerOutputsJanuary > 0 ||
                                      model.PowerOutputsFebruary > 0 ||
                                      model.PowerOutputsMarch > 0 ||
                                      model.PowerOutputsApril > 0 ||
                                      model.PowerOutputsMay > 0 ||
                                      model.PowerOutputsJune > 0 ||
                                      model.PowerOutputsJuly > 0 ||
                                      model.PowerOutputsAugust > 0 ||
                                      model.PowerOutputsSeptember > 0 ||
                                      model.PowerOutputsOctober > 0 ||
                                      model.PowerOutputsNovember > 0 ||
                                      model.PowerOutputsDecember > 0;

            if (isPowerGroupFilled)
            {
                if (string.IsNullOrEmpty(model.PowerType))
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if (!model.ShouldItBeIncludedInCHPQAcalculationsPowerOutputs.HasValue)
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if ((model.PowerOutputsJanuary <= 0 || model.PowerOutputsJanuary == null) &&
                    (model.PowerOutputsFebruary <= 0 || model.PowerOutputsFebruary == null) &&
                    (model.PowerOutputsMarch <= 0 || model.PowerOutputsMarch == null) &&
                    (model.PowerOutputsApril <= 0 || model.PowerOutputsApril == null) &&
                    (model.PowerOutputsMay <= 0 || model.PowerOutputsMay == null) &&
                    (model.PowerOutputsJune <= 0 || model.PowerOutputsJune == null) &&
                    (model.PowerOutputsJuly <= 0 || model.PowerOutputsJuly == null) &&
                    (model.PowerOutputsAugust <= 0 || model.PowerOutputsAugust == null) &&
                    (model.PowerOutputsSeptember <= 0 || model.PowerOutputsSeptember == null) &&
                    (model.PowerOutputsOctober <= 0 || model.PowerOutputsOctober == null) &&
                    (model.PowerOutputsNovember <= 0 || model.PowerOutputsNovember == null) &&
                    (model.PowerOutputsDecember <= 0 || model.PowerOutputsDecember == null))
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
            }

            bool isHeatRejectionGroupFilled = !string.IsNullOrEmpty(model.HeatType) ||
                                               (model.ShouldItBeIncludedInCHPQAcalculationsHeatOutputs.HasValue && model.ShouldItBeIncludedInCHPQAcalculationsHeatOutputs != null) ||
                                               model.HeatOutputsJanuary > 0 ||
                                               model.HeatOutputsFebruary > 0 ||
                                               model.HeatOutputsMarch > 0 ||
                                               model.HeatOutputsApril > 0 ||
                                               model.HeatOutputsMay > 0 ||
                                               model.HeatOutputsJune > 0 ||
                                               model.HeatOutputsJuly > 0 ||
                                               model.HeatOutputsAugust > 0 ||
                                               model.HeatOutputsSeptember > 0 ||
                                               model.HeatOutputsOctober > 0 ||
                                               model.HeatOutputsNovember > 0 ||
                                               model.HeatOutputsDecember > 0 ||
                                               model.EstimatedTotalHeatOutputUsedInthePrimeMovers > 0 ||
                                               model.EstimatedTotalHeatOutputUsedIntheBoilers > 0;


            if (isHeatRejectionGroupFilled)
            {
                if (!model.ShouldItBeIncludedInCHPQAcalculationsHeatOutputs.HasValue)
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if (string.IsNullOrEmpty(model.HeatType))
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if ((model.HeatOutputsJanuary <= 0 || model.HeatOutputsJanuary == null) &&
                    (model.HeatOutputsFebruary <= 0 || model.HeatOutputsFebruary == null) &&
                    (model.HeatOutputsMarch <= 0 || model.HeatOutputsMarch == null) &&
                    (model.HeatOutputsApril <= 0 || model.HeatOutputsApril == null) &&
                    (model.HeatOutputsMay <= 0 || model.HeatOutputsMay == null) &&
                    (model.HeatOutputsJune <= 0 || model.HeatOutputsJune == null) &&
                    (model.HeatOutputsJuly <= 0 || model.HeatOutputsJuly == null) &&
                    (model.HeatOutputsAugust <= 0 || model.HeatOutputsAugust == null) &&
                    (model.HeatOutputsSeptember <= 0 || model.HeatOutputsSeptember == null) &&
                    (model.HeatOutputsOctober <= 0 || model.HeatOutputsOctober == null) &&
                    (model.HeatOutputsNovember <= 0 || model.HeatOutputsNovember == null) &&
                    (model.HeatOutputsDecember <= 0 || model.HeatOutputsDecember == null))
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if ((model.EstimatedTotalHeatOutputUsedInthePrimeMovers <= 0) && isFirstHeatEntry)
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
                if ((model.EstimatedTotalHeatOutputUsedIntheBoilers <= 0) && isFirstHeatEntry)
                {
                    return ValidationResult.Invalid("The spreadsheet is missing data");
                }
            }

            if (!isFuelGroupFilled && !isPowerGroupFilled && !isHeatRejectionGroupFilled)
            {
                return ValidationResult.Invalid("The spreadsheet is missing data");
            }

            return ValidationResult.Valid();
        }

        public class f4cModel
        {
            public string? MeterTagNumber { get; set; }
            public string? FuelCategory { get; set; }
            public string? FuelType { get; set; }
            public bool? ShouldItBeIncludedInCHPQAcalculationsEnergyInputs { get; set; }
            public decimal? EnergyInputsJanuary { get; set; }
            public decimal? EnergyInputsFebruary { get; set; }
            public decimal? EnergyInputsMarch { get; set; }
            public decimal? EnergyInputsApril { get; set; }
            public decimal? EnergyInputsMay { get; set; }
            public decimal? EnergyInputsJune { get; set; }
            public decimal? EnergyInputsJuly { get; set; }
            public decimal? EnergyInputsAugust { get; set; }
            public decimal? EnergyInputsSeptember { get; set; }
            public decimal? EnergyInputsOctober { get; set; }
            public decimal? EnergyInputsNovember { get; set; }
            public decimal? EnergyInputsDecember { get; set; }
            public decimal? EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers { get; set; }
            public decimal? EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers { get; set; }
            public string? PowerType { get; set; }
            public bool? ShouldItBeIncludedInCHPQAcalculationsPowerOutputs { get; set; }
            public decimal? PowerOutputsJanuary { get; set; }
            public decimal? PowerOutputsFebruary { get; set; }
            public decimal? PowerOutputsMarch { get; set; }
            public decimal? PowerOutputsApril { get; set; }
            public decimal? PowerOutputsMay { get; set; }
            public decimal? PowerOutputsJune { get; set; }
            public decimal? PowerOutputsJuly { get; set; }
            public decimal? PowerOutputsAugust { get; set; }
            public decimal? PowerOutputsSeptember { get; set; }
            public decimal? PowerOutputsOctober { get; set; }
            public decimal? PowerOutputsNovember { get; set; }
            public decimal? PowerOutputsDecember { get; set; }
            public string? HeatType { get; set; }
            public bool? ShouldItBeIncludedInCHPQAcalculationsHeatOutputs { get; set; }
            public decimal? HeatOutputsJanuary { get; set; }
            public decimal? HeatOutputsFebruary { get; set; }
            public decimal? HeatOutputsMarch { get; set; }
            public decimal? HeatOutputsApril { get; set; }
            public decimal? HeatOutputsMay { get; set; }
            public decimal? HeatOutputsJune { get; set; }
            public decimal? HeatOutputsJuly { get; set; }
            public decimal? HeatOutputsAugust { get; set; }
            public decimal? HeatOutputsSeptember { get; set; }
            public decimal? HeatOutputsOctober { get; set; }
            public decimal? HeatOutputsNovember { get; set; }
            public decimal? HeatOutputsDecember { get; set; }
            public decimal? EstimatedTotalHeatOutputUsedInthePrimeMovers { get; set; }
            public decimal? EstimatedTotalHeatOutputUsedIntheBoilers { get; set; }
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

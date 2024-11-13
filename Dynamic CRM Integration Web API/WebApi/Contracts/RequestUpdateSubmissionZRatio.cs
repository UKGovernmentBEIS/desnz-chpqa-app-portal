using System.ComponentModel.DataAnnotations;

namespace WebApi.Contracts
{
    public class RequestUpdateSubmissionZRatio
    {
        [Required]
        public Guid? idSubmission { get; set; }
        [Required]
        public bool? zRatioDetermined { get; set; }        //desnz_isthezratioofthisschemedetermined
        public string? possibleToDetermineZRatio { get; set; } //desnz_whyitisnotpossibletodeterminethezration
        [Required]
        [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
        public decimal? steamExportPressure { get; set; }       //desnz_steamexportpressure
        [Required]
        [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
        public decimal? steamturbinesize { get; set; }          //desnz_steamturbinesize
        [Required]
        [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
        public decimal? zratio { get; set; }                   //desnz_zratio


    }
}

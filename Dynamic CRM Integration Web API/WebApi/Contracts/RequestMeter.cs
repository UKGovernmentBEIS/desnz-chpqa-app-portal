using System.ComponentModel.DataAnnotations;
using WebApi.Model;

namespace WebApi.Contracts
{
    public class RequestMeter
    {
        public Guid? id { get; set; }
        [Required] 
        public string? name { get; set; }
        [Required]
        public string? tagNumber { get; set; }
        [Required]
        [Range((int)Meter.MeasureType.EnergyInput, (int)Meter.MeasureType.HeatOutput)]
        public int? measureType { get; set; }
        [Required] 
        public Guid? equipmentTypeId { get; set; }
        [Required] 
        public Guid? equipmentSubTypeId { get; set; }
        [Required] 
        public string? serialNumber { get; set; }
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "The value must be a positive number.")]
        public int? yearInstalled { get; set; }
        [Required]
        public int? existingOrProposed { get; set; }
        
        public bool? mainGasMeter { get; set; }
        
        public string? mainGasMeterNumber { get; set; }         // desnz_maingasmeternumber

        //public int? meteredService { get; set; }
        //public int? meteredServiceF2s { get; set; }
        [Required]
        [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
        public decimal? outputRangeMin { get; set; }             // desnz_outputrangeminimumflowrate
        [Required]
        [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
        public decimal? outputRangeMax { get; set; }             // desnz_outputrangemaximumflowrate
        [Required]
        public OutputUnit? outputUnit { get; set; }             // desnz_outputunit
        [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
        public double? uncertainty { get; set; }
        public string? comments { get; set; }

    }
}

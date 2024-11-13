using WebApi.Model;

namespace WebApi.Contracts
{
    public class ReplyMeter
    {
        public Guid? id { get; set; }                           // desnz_fuelmetersid

        public string? name { get; set; }                      // desnz_name
        public string? tagNumber { get; set; }                    // desnz_tagnum

        public ReplyEquipmentType equipmentType { get; set; }
        public ReplyEquipmentSubType equipmentSubType { get; set; }

        public string? serialNumber { get; set; }              // desnz_serialnumber

        public int? yearInstalled { get; set; }                // desnz_yearinstalled

        public int? existingOrProposed { get; set; }            // desnz_existingorproposed

        public bool? mainGasMeter { get; set; }                // desnz_maingasmeter
        public string? mainGasMeterNumber { get; set; }         // desnz_maingasmeternumber

        //public int? meteredService { get; set; }               // desnz_meteredservice
        //public int? meteredServiceF2s { get; set; }            // desnz_meteredservicef2s for F2s

        public int? measureType { get; set; }

        public decimal? outputRangeMin { get; set; }            // desnz_outputrangeminimumflowrate
        public decimal? outputRangeMax { get; set; }            // desnz_outputrangemaximumflowrate

        public OutputUnit? outputUnit { get; set; }              // desnz_outputunit


        public double? uncertainty { get; set; }               // desnz_uncertainty for F2

        public string? comments { get; set; }                    // desnz_comments

        public List<ReplyMeterFile>? meterFilesList { get; set; }    // desnz_meterfiles

    }

    public class ReplyMeterFile                  // desnz_meterfiles
    {

        public Guid? id { get; set; }           // desnz_meterfilesid

        public string? name { get; set; }       // desnz_name

        //public Guid? meter { get; set; }       // desnz_meter

    }
}

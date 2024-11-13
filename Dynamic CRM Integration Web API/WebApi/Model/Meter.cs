namespace WebApi.Model
{
    public class Meter                                          // desnz_fuelmeters
    {
        //do not need to set ID for create
        public Guid? id { get; set; }                           // desnz_fuelmetersid

        public string? name {  get; set; }                      // desnz_name
        public string? tagNumber {  get; set; }                 // desnz_tagnum

        public EquipmentType? equipmentType { get; set; }       // desnz_equipmenttype

        public EquipmentSubType? equipmentSubType { get; set; }   // desnz_equipmentsubtype

        public string? serialNumber {  get; set; }              // desnz_serialnumber

        public int? yearInstalled {  get; set; }                // desnz_yearinstalled

        public int? existingOrProposed { get; set; }            // desnz_existingorproposed

        public bool? mainGasMeter {  get; set; }                // desnz_maingasmeter
        public string? mainGasMeterNumber { get; set; }         // desnz_maingasmeternumber
        public int? measureType { get; set; }

        //public int? meteredService {  get; set; }               // desnz_meteredservice
        //public int? meteredServiceF2s {  get; set; }            // desnz_meteredservicef2s for F2s

        //public string? outputsRange {  get; set; }              // desnz_outputsrange
        public decimal? outputRangeMin {  get; set; }            // desnz_outputrangeminimumflowrate
        public decimal? outputRangeMax {  get; set; }            // desnz_outputrangemaximumflowrate

        public OutputUnit? outputUnit {  get; set; }              // desnz_outputunit

        public double? uncertainty {  get; set; }               // desnz_uncertainty for F2

        public string? comments { get; set; }                    // desnz_comments

        public List<MeterFile>? meterFilesList { get; set; }    // desnz_meterfiles

        public enum MeasureType
        {
            EnergyInput = 0,
            PowerOutput = 1,
            HeatOutput = 2
        }

        public enum ExistingOrProposed
        {
            Existing = 0,
            Proposed = 1
        }
    }
}

namespace WebApi.Model
{
    public class PowerOutput            // desnz_poweroutputs
    {
        public Guid? id { get; set; }                           // desnz_poweroutputsid
        public string? tag { get; set; }                        // desnz_name
        public string? tagNumber { get; set; }                  // desnz_tagnum
        public string? tagPrefix { get; set; }                  // desnz_tagprefix
        public string? userTag { get; set; }                    // desnz_tag
        public string? serialNumber { get; set; }               // desnz_serialnumber
        public string? diagramReferenceNumber { get; set; }     // desnz_diagramreferencenumber
        public bool? includeInCalculations { get; set; }        // desnz_arethereanychpqacalculations
        public int? powerType { get; set; }                     // desnz_type
        public EquipmentSubType meterType { get; set; }         // desnz_metertype
        public Meter meter { get; set; }                        // desnz_meter
        public int? year { get; set; }                          // desnz_year
        public decimal? january { get; set; }                   // desnz_january
        public decimal? february { get; set; }                  // desnz_february
        public decimal? march { get; set; }                     // desnz_march
        public decimal? april { get; set; }                     // desnz_april
        public decimal? may { get; set; }                       // desnz_may
        public decimal? june { get; set; }                      // desnz_june
        public decimal? july { get; set; }                      // desnz_july
        public decimal? august { get; set; }                    // desnz_august
        public decimal? september { get; set; }                 // desnz_september
        public decimal? october { get; set; }                   // desnz_october
        public decimal? november { get; set; }                  // desnz_november
        public decimal? december { get; set; }                  // desnz_december
        public decimal? annualTotal { get; set; }               // desnz_annualtotal


        public enum PowerType
        {
            Generated = 0,
            Exported = 1,
            Imported = 2
        }
    }
}

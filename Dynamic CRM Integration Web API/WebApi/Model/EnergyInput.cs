namespace WebApi.Model
{
    public class EnergyInput                // desnz_fuelinputs
    {
        public Guid? id { get; set; }                           // desnz_fuelinputsid
        public string? tag { get; set; }                        // desnz_name
        public string? tagNumber { get; set; }                  // desnz_tagnum
        public string? tagPrefix { get; set; }                  // desnz_tagprefix
        public string? userTag { get; set; }                    // desnz_tag
        public string? serialNumber { get; set; }               // desnz_serialnumber
        public Meter? meter { get; set; }                       // desnz_meter
        public FuelCategory? fuelCategory { get; set; }         // desnz_fuelcategory
        public Fuel? fuel { get; set; }                         // desnz_fuel
        public int? year { get; set; }                          // desnz_year1
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
        public decimal? xValue { get; set; }                    // desnz_xvalue
        public decimal? yValue { get; set; }                    // desnz_yvalue
        public decimal? fnX { get; set; }                       // desnz_fnxn
        public decimal? fnY { get; set; }                       // desnz_fn_yn
        public decimal? rocscfdX { get; set; }                  // desnz_rocsxvalue
        public decimal? rocscfdY { get; set; }                  // desnz_rocsyvalue
        public decimal? rocscfdFnX { get; set; }                // desnz_rocsfnxn
        public decimal? rocscfdFnY { get; set; }                // desnz_rocsfnyn


        public decimal? fractionTFI { get; set; }                // desnz_fractionoftotalfuelinput
        public bool? includeInCalculations { get; set; }         // desnz_calculationused
    }
}

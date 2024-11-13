namespace WebApi.Model
{
    public class FuelCategory                           // desnz_fuelcategory
    {
        public Guid? id { get; set; }                   // desnz_fuelcategoryid
        public string? name { get; set; }               // desnz_name
        public string? category { get; set; }           // desnz_category
        public string? tooltip { get; set; }            // desnz_tooltip
        public bool? ROCS { get; set; }                 // desnz_rocs
        public bool? renewable { get; set; }            // desnz_renewable
    }
}

namespace WebApi.Model
{
    public class EconomicSubSector                  // desnz_subsector
    {
        public Guid? id { get; set; }                           // desnz_subsectorid
        public string? name { get; set; }                       // desnz_name
        public EconomicSector? economicSector { get; set; }      // desnz_sector
    }
}

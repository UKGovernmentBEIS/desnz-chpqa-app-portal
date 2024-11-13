namespace WebApi.Model
{
    public class EconomicSector                 // desnz_sector
    {
        public Guid? id { get; set; }           // desnz_sectorid
        public string? name { get; set; }       // desnz_name
        public List<EconomicSubSector>? economicSubSectorList { get; set; }
    }
}

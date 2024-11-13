namespace WebApi.Model
{
    public class EquipmentSubType                       // desnz_equipmentsubtype
    {

        public Guid? id { get; set; }                   // desnz_equipmentsubtypeid
        public string? name { get; set; }               // desnz_name
        public string? suffix { get; set; }             // desnz_suffix
        public EquipmentType? equipmentType { get; set; }             // desnz_equipmenttype

    }
}

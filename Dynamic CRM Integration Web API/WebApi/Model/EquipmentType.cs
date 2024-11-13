namespace WebApi.Model
{
    public class EquipmentType                          // desnz_equipmenttype
    {

        public Guid? id { get; set; }                   // desnz_equipmenttypeid
        public string? name { get; set; }               // desnz_name
        public string? prefix { get; set; }             // desnz_prefix

        public List<EquipmentSubType>? equipmentSubTypeList { get; set; }


    }
}

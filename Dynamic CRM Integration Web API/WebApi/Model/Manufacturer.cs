namespace WebApi.Model
{
    public class Manufacturer       // desnz_manufacturer
    {
        //do not need to set ID for create
        public Guid? id { get; set; }           // desnz_manufacturerid
        public string? name {  get; set; }      // desnz_name
        public int? statecode {  get; set; }      // statecode


    }
}

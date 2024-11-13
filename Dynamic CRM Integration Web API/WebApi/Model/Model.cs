namespace WebApi.Model
{
    public class Model          // desnz_modelnumber
    {
        //do not need to set ID for create
        public Guid? id { get; set; }               // desnz_modelnumberid
        public string? name {  get; set; }          // desnz_name

        public Manufacturer? manufacturer { get; set; }     // desnz_manufacturer



    }
}

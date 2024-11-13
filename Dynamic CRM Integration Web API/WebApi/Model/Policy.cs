namespace WebApi.Model
{
    public class Policy             // desnz_schemepolicy
    {
        public Guid? id { get; set; }           // desnz_schemepolicyid
        public string? name {  get; set; }      // desnz_name
        public int? type {  get; set; }         // desnz_type
        public bool? latest {  get; set; }      // desnz_latest

        public enum PolicyTypes
        {
            CHPQA = 0,
            ROCs = 1,
            CFD = 2
        }
    }


}

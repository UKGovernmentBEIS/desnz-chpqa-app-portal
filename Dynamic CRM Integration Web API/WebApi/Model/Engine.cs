namespace WebApi.Model
{
    public class Engine             // desnz_engine
    {
        //do not need to set ID for create
        public Guid? id { get; set; }           // desnz_engineid
        public string? name {  get; set; }      // desnz_name
        public Model? model { get; set; }       // desnz_model


    }
}

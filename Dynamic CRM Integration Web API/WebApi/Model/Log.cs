namespace WebApi.Model
{
    public class Log                                            // desnz_log
    {
        public Guid? id { get; set; }                           // desnz_logid
        public string? name { get; set; }                       // desnz_name
        public string? stackTrace { get; set; }                 // desnz_stacktrace
        public string? message { get; set; }                    // desnz_message
        public Person? user { get; set; }                       // desnz_user

    }
}

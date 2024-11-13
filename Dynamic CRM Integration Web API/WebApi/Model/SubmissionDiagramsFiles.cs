namespace WebApi.Model
{
    public class SubmissionDiagramsFiles                // desnz_submissiondiagramsfiles
    {

        public Guid? id { get; set; }           // desnz_submissiondiagramsfilesid

        public string? name { get; set; }       // desnz_name

        public string? file { get; set; }       // desnz_file

        public string? type { get; set; }       // desnz_type

        public string? diagramType { get; set; }       // desnz_diagramtype

        //public Submission? submission { get; set; }       // desnz_submission

        public enum FileAttribute
        {
            lenght = 250,
            
        }


    }
}

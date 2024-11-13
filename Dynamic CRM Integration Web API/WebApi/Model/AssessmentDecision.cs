namespace WebApi.Model
{
    public class AssessmentDecision                             // desnz_assessmentdecision
    {
        public Guid? id { get; set; }                           // desnz_assessmentdecisionid
        public string? name { get; set; }                       // desnz_name
        public bool? certificateChoice { get; set; }            // desnz_choice
        public Person? technicalAssessor2 { get; set; }         // desnz_technicalassessor2
        public Submission? submission { get; set; }             // desnz_submission
    }
}

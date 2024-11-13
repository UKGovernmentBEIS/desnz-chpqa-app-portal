using System.ComponentModel.DataAnnotations;

namespace WebApi.Model
{
    public class SubmissionGroupDetails                         // desnz_groupdetail
    {

        public Guid? id;                                        // desnz_groupdetailid

        public int? assessmentOutcome {  get; set; }             // desnz_assessmentstatus

        public string changeNeededComment { get; set; }         // desnz_changeneededcomment

        public string sectionAssessmentComment { get; set; }    // desnz_sectionassessmentcomment

        public enum AssessmentOutcome                           
        {
            Approved = 0,
            NeedsChange = 1,
            Rejected = 2
        }
    }
}

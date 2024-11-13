using static WebApi.Model.SubmissionGroupDetails;
using System.ComponentModel.DataAnnotations;

namespace WebApi.Contracts
{
    public class RequestSubmGroupDetails                        // desnz_groupdetail
    {
        [Range((int)AssessmentOutcome.Approved, (int)AssessmentOutcome.Rejected)]
        public int? assessmentOutcome { get; set; }             // desnz_assessmentstatus

        public string changeNeededComment { get; set; }         // desnz_changeneededcomment

        public string sectionAssessmentComment { get; set; }    // desnz_sectionassessmentcomment
    }
}

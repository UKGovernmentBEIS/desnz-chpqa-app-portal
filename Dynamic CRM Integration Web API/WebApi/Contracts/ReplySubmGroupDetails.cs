using System.ComponentModel.DataAnnotations;

namespace WebApi.Contracts
{
    public class ReplySubmGroupDetails

    {
        public Guid id { get; set; }                                        // desnz_groupdetailid

        public int? assessmentOutcome { get; set; }             // desnz_assessmentstatus

        public string changeNeededComment { get; set; }         // desnz_changeneededcomment

        public string sectionAssessmentComment { get; set; }    // desnz_sectionassessmentcomment
    }
}

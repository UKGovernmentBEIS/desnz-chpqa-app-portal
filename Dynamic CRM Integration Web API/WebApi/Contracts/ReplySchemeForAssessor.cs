using WebApi.Model;

namespace WebApi.Contracts
{
    public class ReplySchemeForAssessor : ReplyScheme
    {

        public Person? assessor { get; set; }                  // desnz_assessor
        public Person? secondAssessor { get; set; }                  // desnz_secondassessor


    }
}

using Microsoft.Crm.Sdk;

namespace WebApi.Model
{
    public class Equipment                                  // desnz_primemovers
    {

        //do not need to set ID for create
        public Guid? id { get; set; }                       // desnz_primemoversid
        public string? name { get; set; }                   // desnz_name
        public string? tagNumber { get; set; }              // desnz_tagnum

        public int? yearCommissioned { get; set; }          // desnz_yearcommissioned

        public EquipmentType? equipmentType { get; set; }   // desnz_equipmenttype

        public EquipmentSubType? equipmentSubType { get; set; }   // desnz_equipmentsubtype

        public bool? mechanicalLoad { get; set; }           // desnz_mechanicalload

        public Manufacturer? manufacturer { get; set; }     // desnz_manufacturer
        public string? manufacturerOther { get; set; }      // desnz_manufacturerother

        public Model? model { get; set; }                   // desnz_model
        public string? modelOther { get; set; }             // desnz_modelother

        public Unit? engineUnit { get; set; }               // desnz_unit     engine unit from list
        public string? engineUnitOther { get; set; }        // desnz_unitother     engine unit from user input

                                                            // engine unit data
        public double? heatkw {  get; set; }                // desnz_heatkw

        public double? powerkwe { get; set; }               // desnz_powerkwe
        
        public double? fuelInputKw { get; set; }            // desnz_fuelinputkw

        public double? powerEfficiency { get; set; }        // desnz_powerefficiency

        public double? maxHeatToPowerRatio { get; set; }    // desnz_maxheattopowerratio

        public double? maxHeatEfficiency { get; set; }      // desnz_maxheatefficiency

        public double? maxOverallEfficiency { get; set; }   // desnz_maxoverallefficiency
        
        public string? comments { get; set; }               // desnz_comments

        public List<EquipmentFile>? equipmentFilesList { get; set; }    // desnz_equipmentfiles

        //public Submission? submission { get; set; }       // desnz_submission
    }
}

namespace WebApi.Model
{
    public class Unit               // desnz_unit
    {
        //do not need to set ID for create
        public Guid? id { get; set; }       // desnz_unitid

        public string? name {  get; set; }      // desnz_name

        public Manufacturer? manufacturer { get; set; }     // desnz_manufacturer

        public Model? model { get; set; }           // desnz_model

        public Engine? engine { get; set; }         // desnz_engine

        public double? totalPowerCapacityKw { get; set; }       // desnz_totalpowercapacitykw

        public double? totalHeatCapacityKw { get; set; }        // desnz_totalheatcapacitykw

        public double? fuelInputKw { get; set; }        // desnz_fuelinputkw

        public double? powerEfficiency { get; set; }        // desnz_powerefficiency

        public double? maxHeatToPowerRatio { get; set; }        // desnz_maxheattopowerratio

        public double? maxHeatEfficiency { get; set; }          // desnz_maxheatefficiency

        public double? maxOverallEfficiency { get; set; }       // desnz_maxoverallefficiency




    }
}

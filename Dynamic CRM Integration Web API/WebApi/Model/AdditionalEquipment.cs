namespace WebApi.Model
{
    public class AdditionalEquipment                                    // desnz_additionalequipment
    {
        //do not need to set ID for create
        public Guid? id { get; set; }                                   // desnz_additionalequipmentid

        public string? name {  get; set; }                              // desnz_name

        public Manufacturer? manufacturerUnit {  get; set; }            // desnz_manufacturerunit

        public string? manufacturer {  get; set; }                      // desnz_manufacturer

        //public Unit? unit { get; set; }
        public string? model {  get; set; }                             // desnz_model

        public int? numberInstalled {  get; set; }                      // desnz_numberinstalled


        public int? usageFrequency {  get; set; }                       // desnz_usagefrequency    choice list 0 - 2

        public double? estimatedEnergyConsumptionKwe {  get; set; }     // desnz_estimatedenergyconsumptionkwe

        public double? estimatedEnergyConsumptionKwth {  set; get; }    // desnz_estimatedenergyconsumptionkwth

        public string? comments { get; set; }                             // desnz_comments


    }
}

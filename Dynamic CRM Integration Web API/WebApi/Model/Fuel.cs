namespace WebApi.Model
{
    public class Fuel                                       // desnz_fuel
    {
        public Guid? id { get; set; }                       // desnz_fuelid
        public string? name { get; set; }                   // desnz_name
        public FuelCategory? fuelCategory { get; set; }     // desnz_category

    }
}

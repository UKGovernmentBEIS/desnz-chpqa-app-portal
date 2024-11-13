namespace WebApi.Contracts
{
    public class ReplyEquipment
    {

        public Guid? id { get; set; }
        public string? name { get; set; }
        public string? tagNumber { get; set; }

        public int? yearCommissioned { get; set; }

        public ReplyEquipmentType equipmentType { get; set; }
        public ReplyEquipmentSubType equipmentSubType { get; set; }

        /*public string? equipmentTypeName { get; set; }
        public string? equipmentTypePrefix { get; set; }

        public string? equipmentSubTypeName { get; set; }
        public string? equipmentSubTypeSuffix { get; set; }
        */
        public bool? mechanicalLoad { get; set; }



        public ReplyUnit unit { get; set; }

        public string? comments { get; set; }

        public List<ReplyEquipmentFile>? equipmentFilesList { get; set; }

    }

    public class ReplyUnit
    {

        public ReplyManufacturer? manufacturer { get; set; }

        public ReplyModel? model { get; set; }

        public ReplyEngine? engine { get; set; }

        // engine unit data
        public Guid? id { set; get; }
        public double? totalPowerCapacityKw { get; set; }

        public double? totalHeatCapacityKw { get; set; }

        public double? fuelInputKw { get; set; }

        public double? powerEfficiency { get; set; }

        public double? maxHeatToPowerRatio { get; set; }

        public double? maxHeatEfficiency { get; set; }

        public double? maxOverallEfficiency { get; set; }

    }

    public class ReplyEquipmentFile                  // desnz_equipmentfiles
    {

        public Guid? id { get; set; }           // desnz_equipmentfilesid

        public string? name { get; set; }       // desnz_name

        //public Guid? equipment { get; set; }       // desnz_equipment

    }
}

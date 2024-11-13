using Microsoft.PowerPlatform.Dataverse.Client;
namespace WebApi.Services
{
    public interface IServiceClientFactory
    {
        ServiceClient CreateServiceClient();
    }
    public class ServiceClientFactory : IServiceClientFactory
    {
        private readonly string _dynamicsUrl;
        private readonly string _dynamicsClientId;
        private readonly string _dynamicsClientSecret;

        public ServiceClientFactory(string dynamicsUrl, string dynamicsClientId, string dynamicsClientSecret)
        {
            _dynamicsUrl = dynamicsUrl;
            _dynamicsClientId = dynamicsClientId;
            _dynamicsClientSecret = dynamicsClientSecret;
        }

        public ServiceClient CreateServiceClient()
        {
            return new ServiceClient(new Uri(_dynamicsUrl), _dynamicsClientId, _dynamicsClientSecret, true);
        }
    }
}

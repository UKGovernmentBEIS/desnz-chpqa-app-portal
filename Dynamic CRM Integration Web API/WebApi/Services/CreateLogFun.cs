using Microsoft.Xrm.Sdk;
using System.Security.Claims;
using WebApi.Functions;
using WebApi.Model;


namespace WebApi.Services
{
    public class CreateLogFun
    {

        private readonly IServiceClientFactory _serviceClientFactory;
        public CreateLogFun(IServiceClientFactory serviceClientFactory)
        {
            _serviceClientFactory = serviceClientFactory;
        }

        public async Task CreateFun(string name, Exception ex, ClaimsPrincipal user)
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {
                Person userPerson = await HelperFunctions.GetUserPersonInfoAsync(serviceClient, user);

                // make new Log entry
                Entity logEntity = new Entity("desnz_log");

                logEntity["desnz_name"] = name;
                logEntity["desnz_stacktrace"] = ex.StackTrace;
                logEntity["desnz_message"] = ex.Message;
                if (userPerson.id != null)
                {
                    logEntity["desnz_user"] = new EntityReference("contact", userPerson.id ?? Guid.Empty);
                }

                logEntity.Id = await serviceClient.CreateAsync(logEntity);
            }
        }
        public async Task CreateFun(string name, string message, ClaimsPrincipal user)
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {
                Person userPerson = await HelperFunctions.GetUserPersonInfoAsync(serviceClient, user);

                // make new Log entry
                Entity logEntity = new Entity("desnz_log");

                logEntity["desnz_name"] = name;
                logEntity["desnz_message"] = message;
                if (userPerson.id != null)
                {
                    logEntity["desnz_user"] = new EntityReference("contact", userPerson.id ?? Guid.Empty);
                }

                logEntity.Id = await serviceClient.CreateAsync(logEntity);
            }
        }
        public async Task CreateFun(string name, Exception ex)
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {

                // make new Log entry
                Entity logEntity = new Entity("desnz_log");

                logEntity["desnz_name"] = name;
                logEntity["desnz_stacktrace"] = ex.StackTrace;
                logEntity["desnz_message"] = ex.Message;
                logEntity.Id = await serviceClient.CreateAsync(logEntity);
            }
        }
        public async Task CreateFun(string name, String message)
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {

                // make new Log entry
                Entity logEntity = new Entity("desnz_log");

                logEntity["desnz_name"] = name;
                logEntity["desnz_stacktrace"] = message;
                logEntity["desnz_message"] = message;
                logEntity.Id = await serviceClient.CreateAsync(logEntity);
            }
        }
    }
}

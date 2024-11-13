using WebApi.Model;
using WebApi.Functions;


namespace WebApi.Services
{
    

    public class EmailPeriodicTaskService : BackgroundService
    {
        private readonly ILogger<EmailPeriodicTaskService> _logger;
        private readonly IHostApplicationLifetime _appLifetime;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly ITaskStartChecker _taskStartChecker;
        private readonly ITaskGetStartDate _taskStartDate;
        private readonly IRPDataStack _taskGetRPData;
        private readonly IConfiguration _config;

        private List<Person> _stackOfRPs;
        public EmailPeriodicTaskService(IConfiguration configuration, ILogger<EmailPeriodicTaskService> logger, IHostApplicationLifetime appLifetime, IServiceClientFactory serviceClientFactory)
        {
            _config = configuration;
            _logger = logger;
            _appLifetime = appLifetime;
            _serviceClientFactory = serviceClientFactory;
            _taskStartChecker = new TaskStartChecker(_serviceClientFactory);
            _taskStartDate = new TaskGetStartDate(_serviceClientFactory);
            _taskGetRPData = new GetResponsiblePersonStack(_logger, _serviceClientFactory);

            _appLifetime.ApplicationStopping.Register(OnStopping);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PeriodicTaskService started.");
            
            while (!stoppingToken.IsCancellationRequested && await _taskStartChecker.TaskShouldStart() is true)
            {
                // Perform periodic task
                await PerformTaskAsync(stoppingToken);
                _logger.LogInformation($"\n\nstoppingToken 2 is:{stoppingToken.IsCancellationRequested.ToString()}\n\n");
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken); // Delay between executions
            }
            _logger.LogInformation("EmailPeriodicTaskService stopping.");
        }

        private void OnStopping()
        {
            _logger.LogInformation("Application is stopping, background service shutting down.");
        }

        private async Task PerformTaskAsync(CancellationToken cancellationToken)
        {
            // Custom task logic
            _stackOfRPs = await _taskGetRPData.CollectRPData();

            IEmailFromGeneralTemplate emailBuilder;
            DateTime LastSubmissionDate = await _taskStartDate.ProvideLastSubmissionDate();

            foreach (var p in _stackOfRPs)
            {
                //if (p.lastName.ToUpper().Equals("PASVANTIDIS"))
                //{
                    emailBuilder = new CreateEmailFromGeneralTemplate(_config, _logger, p.email ?? "");
                    emailBuilder.SendGeneralEmail(
                        emailBuilder.BuildEmailFromData(
                            emailBuilder.BuildSubject("#Combined Heat and Power Quality Assurance programme: scheme returned to RP", null),
                            emailBuilder.BuildHeader("Dear [NAME]", new Dictionary<string, string>() {
                            {"[NAME]", $"{p.firstName} {p.lastName}"}
                                }),
                                emailBuilder.BuildBody("Schemes have a final submission deadline of [DATE]." +
                                "\r\nPlease ensure your submission reaches us by this date.\r\n\r\n",
                                new Dictionary<string, string>()
                                {
                            {"[DATE]",  $"{LastSubmissionDate}"}
                                }),
                                emailBuilder.BuildFooter("---\r\n" +
                                "##[Sign in to your account]( [LoginLink] )\r\n\r\n" +
                                "This is an automated email - please do not reply to it.\r\n" + 
                                "Combined Heat and Power Quality Assurance programme"
                                , new Dictionary<string, string> { { "[LoginLink]", _config["LoginPage"] } })
                        )
                    );
                //}
            }

            await _taskStartChecker.InvalidateTrigger(); // Since we have send all the emails we must make the flag true.

            await Task.Delay(1000, cancellationToken);
        }
    }
}

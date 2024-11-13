using Microsoft.Extensions.Options;
using nClam;
using System.Security.Claims;
using WebApi.Services;

public class ClamAVScanner
{
    private readonly ILogger<ClamAVScanner> _logger; // Added logger for logging results
    private readonly string _clamAvHost;
    private readonly int _clamAvPort;
    private readonly IServiceClientFactory _serviceClientFactory;

    public ClamAVScanner(ILogger<ClamAVScanner> logger, IOptions<ClamAVSettings> settings, IServiceClientFactory serviceClientFactory)
    {
        _logger = logger;
        _clamAvHost = settings.Value.Host; 
        _clamAvPort = Convert.ToInt32(settings.Value.Port);
        _serviceClientFactory = serviceClientFactory;
    }

    public async Task<bool> ScanFileAsync(byte[] fileBytes, ClaimsPrincipal User)
    {
       
        var clam = new ClamClient(_clamAvHost, _clamAvPort);
        ClamScanResult scanResult = await clam.SendAndScanFileAsync(fileBytes);
        CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
       
        switch (scanResult.Result)
        {
            case ClamScanResults.Clean:        
                _logger.LogInformation("The file is clean! ScanResult: {1}", scanResult.RawResult);
                return true;
            case ClamScanResults.VirusDetected:
                await logEntry.CreateFun("ClamAVScanner", scanResult.InfectedFiles.FirstOrDefault()?.VirusName, User);
                _logger.LogError("Virus Found! Virus name: {1}", scanResult.InfectedFiles.FirstOrDefault()?.VirusName);
                return false;
             
            case ClamScanResults.Error:
                await logEntry.CreateFun("ClamAVScanner", scanResult.InfectedFiles.FirstOrDefault()?.VirusName, User);
                _logger.LogError("An error occurred while scanning the file! ScanResult: {1}", scanResult.RawResult);
                return false;
                
            case ClamScanResults.Unknown:
                await logEntry.CreateFun("ClamAVScanner", scanResult.InfectedFiles.FirstOrDefault()?.VirusName, User);
                _logger.LogError("Unknown scan result while scanning the file! ScanResult: {0}", scanResult.RawResult);
                return false;            
            default:
                return false;
        }
    }
}

public class ClamAVSettings
{
    public string Host { get; set; } // Assuming you have a Host setting
    public string Port { get; set; } // Assuming you have a Port setting
}

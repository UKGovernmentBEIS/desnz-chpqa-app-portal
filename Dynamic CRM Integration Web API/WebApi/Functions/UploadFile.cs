using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using System.Text;

namespace WebApi.Functions
{
    public class UploadFile
    {
        public static void UploadFileToDynamics365(IOrganizationService service, string base64String, EntityReference recordReference, string FileAttributename, string fileName, string mimeType)
        {
            // Decode Base64 string to byte array
            byte[] fileBytes = Convert.FromBase64String(base64String);

            // Upload file in blocks
            var blockSize = 4194304; // Block size for uploading 4194304 ~ 4MB
            var blockIds = new List<string>();

            // Initialize file upload request
            var initializeFileUploadRequest = new InitializeFileBlocksUploadRequest
            {
                FileAttributeName = FileAttributename,
                Target = recordReference,
                FileName = fileName
            };

            // Execute the initialization request
            var fileUploadResponse = (InitializeFileBlocksUploadResponse)service.Execute(initializeFileUploadRequest);

            // Upload file in blocks
            for (int i = 0; i < Math.Ceiling(fileBytes.Length / Convert.ToDecimal(blockSize)); i++)
            {
                var blockId = Convert.ToBase64String(Encoding.UTF8.GetBytes(Guid.NewGuid().ToString()));
                blockIds.Add(blockId);

                var blockData = fileBytes.Skip(i * blockSize).Take(blockSize).ToArray();
                var blockRequest = new UploadBlockRequest()
                {
                    FileContinuationToken = fileUploadResponse.FileContinuationToken,
                    BlockId = blockId,
                    BlockData = blockData
                };

                // Execute block upload request
                var blockResponse = (UploadBlockResponse)service.Execute(blockRequest);
            }

            // Commit the file upload
            var commitRequest = new CommitFileBlocksUploadRequest()
            {
                BlockList = blockIds.ToArray(),
                FileContinuationToken = fileUploadResponse.FileContinuationToken,
                FileName = fileName,
                MimeType = mimeType
            };

            // Execute the commit request
            service.Execute(commitRequest);
        }
        public static void UploadFileToDynamics365(IOrganizationService service, byte[] fileByte, EntityReference recordReference, string FileAttributename, string fileName, string mimeType)
        {
            // Decode Base64 string to byte array
            byte[] fileBytes = fileByte;

            // Upload file in blocks
            var blockSize = 4194304; // Block size for uploading 4194304 ~ 4MB
            var blockIds = new List<string>();

            // Initialize file upload request
            var initializeFileUploadRequest = new InitializeFileBlocksUploadRequest
            {
                FileAttributeName = FileAttributename,
                Target = recordReference,
                FileName = fileName
            };

            // Execute the initialization request
            var fileUploadResponse = (InitializeFileBlocksUploadResponse)service.Execute(initializeFileUploadRequest);

            // Upload file in blocks
            for (int i = 0; i < Math.Ceiling(fileBytes.Length / Convert.ToDecimal(blockSize)); i++)
            {
                var blockId = Convert.ToBase64String(Encoding.UTF8.GetBytes(Guid.NewGuid().ToString()));
                blockIds.Add(blockId);

                var blockData = fileBytes.Skip(i * blockSize).Take(blockSize).ToArray();
                var blockRequest = new UploadBlockRequest()
                {
                    FileContinuationToken = fileUploadResponse.FileContinuationToken,
                    BlockId = blockId,
                    BlockData = blockData
                };

                // Execute block upload request
                var blockResponse = (UploadBlockResponse)service.Execute(blockRequest);
            }

            // Commit the file upload
            var commitRequest = new CommitFileBlocksUploadRequest()
            {
                BlockList = blockIds.ToArray(),
                FileContinuationToken = fileUploadResponse.FileContinuationToken,
                FileName = fileName,
                MimeType = mimeType
            };

            // Execute the commit request
            service.Execute(commitRequest);
        }
    }
}

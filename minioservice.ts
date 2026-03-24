import { Client as MinioClient } from 'minio';

export class MinioClientService {
  private readonly minioClient: MinioClient;

  constructor() {
    this.minioClient = new MinioClient({
      endPoint: 'minio.dev-id.fr',
      port: 443,
      useSSL: true,
      accessKey: 'Qg6Oqi4afzp5bHQ33MD9',
      secretKey: 'b0gJjtWSEYV8oMZAOHbWvZHTHe4yVx196S2gqKEC',
    });
  }

    async uploadFile(file: Buffer, fileName: string): Promise<string> {
    const bucketName = 'meexr';
    const folderName = 'audits';
    const filePath = `${folderName}/${fileName}`;

    const metaData = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline'
    };

    try {
        await this.minioClient.putObject(bucketName, filePath, file, undefined, metaData);
        console.log(`File uploaded successfully: ${fileName}`);

        const fileUrl = `https://minio.dev-id.fr/${bucketName}/${filePath}`;
        return fileUrl;
    } catch (error) {
        console.error('Error uploading file to Minio:', error);
        throw error;
    }
    }
}

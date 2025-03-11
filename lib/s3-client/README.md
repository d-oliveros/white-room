# S3 Client

A TypeScript wrapper for AWS S3 operations providing simplified methods for common S3 interactions.

## Setup

### Environment Variables

The following environment variables are required:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_FILES_BUCKET=your_default_bucket
```

## Features

- Stream, file, and buffer-based downloads
- File uploads with configurable ACL
- Directory uploads
- Object deletion
- Object listing
- Signed URL uploads

## API Reference

### Download Operations

#### `downloadStream(args: DownloadStreamArgs): Promise<NodeJS.ReadableStream>`

Downloads a file from S3 as a readable stream.

```typescript
const stream = await downloadStream({
  sourceFilePath: 'path/to/file.txt',
  bucket: 'optional-bucket-name', // defaults to AWS_FILES_BUCKET
});
```

#### `downloadFile(args: DownloadFileArgs): Promise<string>`

Downloads a file from S3 and saves it locally.

```typescript
const localPath = await downloadFile({
  sourceFilePath: 'path/to/s3/file.txt',
  localFilePath: '/local/path/file.txt', // optional, generates temp path if not provided
  bucket: 'optional-bucket-name',
});
```

#### `downloadAsBuffer(args: DownloadBufferArgs): Promise<Buffer>`

Downloads a file from S3 as a buffer.

```typescript
const buffer = await downloadAsBuffer({
  sourceFilePath: 'path/to/file.txt',
  bucket: 'optional-bucket-name',
});
```

### Upload Operations

#### `uploadToS3(args: UploadToS3Args): Promise<string>`

Uploads a file to S3 and returns the URL.

```typescript
const url = await uploadToS3({
  sourceFilePath: '/local/path/file.txt',
  targetFilePath: 'path/in/s3/file.txt',
  deleteSourceFile: false, // optional, defaults to false
  isPrivate: false, // optional, defaults to false
  bucket: 'optional-bucket-name',
});
```

#### `uploadToSignedS3ObjectUrl(args: SignedUrlUploadArgs): Promise<Response>`

Uploads a file using a pre-signed S3 URL.

```typescript
const response = await uploadToSignedS3ObjectUrl({
  s3PutObjectUrl: 'pre-signed-url',
  localFilePath: '/local/path/file.txt',
});
```

#### `uploadDirToS3(args: UploadDirArgs): Promise<void>`

Recursively uploads a directory to S3.

```typescript
await uploadDirToS3({
  dir: '/local/directory',
  bucketName: 'your-bucket-name',
});
```

### Other Operations

#### `removeFromS3(args: RemoveFromS3Args): Promise<string>`

Removes a file from S3 and returns the URL of the removed file.

```typescript
const removedUrl = await removeFromS3({
  targetFilePath: 'path/to/file.txt',
});
```

#### `listObjectsInBucket(args: ListObjectsArgs): Promise<Object[]>`

Lists objects in an S3 bucket with optional prefix filtering.

```typescript
const objects = await listObjectsInBucket({
  bucketName: 'your-bucket-name',
  prefix: 'optional/prefix/',
});
```

## Error Handling

The client includes built-in error handling and logging. All operations will throw an error if:

- Required AWS credentials are not configured
- S3 operations fail
- File operations fail

## Logging

The client uses `@namespace/logger` for debug and error logging. All operations include detailed debug logs for troubleshooting.

## Types

All method arguments are strictly typed. See the corresponding schema files for detailed type definitions:

- `DownloadStreamArgs`
- `DownloadFileArgs`
- `DownloadBufferArgs`
- `UploadToS3Args`
- `SignedUrlUploadArgs`
- `RemoveFromS3Args`
- `UploadDirArgs`
- `ListObjectsArgs`

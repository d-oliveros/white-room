export type DownloadStreamArgs = {
  sourceFilePath: string;
  bucket?: string;
};

export type DownloadFileArgs = {
  bucket?: string;
  sourceFilePath: string;
  localFilePath?: string;
};

export type DownloadBufferArgs = {
  sourceFilePath: string;
  bucket?: string;
};

export type UploadToS3Args = {
  sourceFilePath: string;
  targetFilePath: string;
  deleteSourceFile?: boolean;
  bucket?: string;
  isPrivate?: boolean;
  userId?: string;
  contentDisposition?: string;
};

export type SignedUrlUploadArgs = {
  s3PutObjectUrl: string;
  localFilePath: string;
};

export type RemoveFromS3Args = {
  targetFilePath: string;
};

export type UploadDirArgs = {
  dir: string;
  bucketName: string;
};

export type ListObjectsArgs = {
  bucketName: string;
  prefix?: string;
};

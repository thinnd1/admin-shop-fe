import {isArray, isObject} from 'util';

/**
 * Metadata model.
 *
 * @author k.sumi 2017/09/22
 */
export class Metadata {

  // Variables
  // --------------------------------------------------------------------------
  readonly contentEncoding: string;
  readonly contentType: string;
  readonly customMetadata: CustomMetadata;
  readonly downloadURL: string;
  readonly generation: number;
  readonly name: string;
  readonly size: number;
  readonly timeCreated: Date;
  readonly type: string;
  readonly updated: Date;


  // Helper
  // --------------------------------------------------------------------------
  static value(data: {}, key: string): any {
    return data.hasOwnProperty(key) ? data[key] : null;
  }

  static stringValue(data: {}, key: string): string {
    const v = this.value(data, key);
    return v ? v as string : null;
  }

  static intValue(data: {}, key: string): number {
    const v = this.value(data, key);
    return v ? +v : 0;
  }

  static dateValue(data: {}, key: string): Date {
    const v = this.value(data, key);
    return v ? new Date(v) : null;

  }

  static arrayValue(data: {}, key: string): string[] {
    const v = this.value(data, key);
    return isArray(v) ? (v as string[]) : [];
  }


  // Constructor
  // --------------------------------------------------------------------------
  constructor(data: {}) {
    if (!data || !isObject(data)) {
      return;
    }
    this.contentEncoding = Metadata.stringValue(data, MetadataKey.ContentEncoding);
    this.contentType = Metadata.stringValue(data, MetadataKey.ContentType);
    this.customMetadata = new CustomMetadata(Metadata.value(data, MetadataKey.CustomMetadata));
    this.generation = Metadata.intValue(data, MetadataKey.Generation);
    this.name = Metadata.stringValue(data, MetadataKey.Name);
    this.size = Metadata.intValue(data, MetadataKey.Size);
    this.timeCreated = Metadata.dateValue(data, MetadataKey.TimeCreated);
    this.type = Metadata.stringValue(data, MetadataKey.Type);
    this.updated = Metadata.dateValue(data, MetadataKey.Updated);
    // Download URLs
    const urls = Metadata.arrayValue(data, MetadataKey.DownloadURLs);
    if (0 < urls.length) {
      this.downloadURL = urls[0];
    }
  }
}

/**
 * Custom metadata interface.
 *
 * @author k.sumi 2017/09/22
 */
export interface ICustomMetadata {
  // 投稿者ユーザーID
  owner?: string;
  // オリジナル画像名
  name: string;
  // グループID
  gid?: string;
  // 連絡グループID
  cid?: string;
  // 画像または動画の幅
  width?: number;
  // 画像または動画の高さ
  height?: number;
  // thumbnail metadata if the original file's type (image or video)
  mime_type?: string;
}

/**
 * Custom metadata model.
 *
 * @author k.sumi 2017/09/22
 */
export class CustomMetadata implements ICustomMetadata {

  // Variables
  // --------------------------------------------------------------------------
  readonly owner: string;
  readonly name: string;
  readonly groupId: string;
  readonly chatId: string;
  readonly width: number;
  readonly height: number;
  readonly original_file_type?: string;


  // Constructor
  // --------------------------------------------------------------------------
  constructor(data: {}) {
    if (!data || !isObject(data)) {
      return;
    }
    this.owner = Metadata.stringValue(data, CustomMetadataKey.Owner);
    this.name = Metadata.stringValue(data, CustomMetadataKey.Name);
    this.groupId = Metadata.stringValue(data, CustomMetadataKey.GroupId);
    this.chatId = Metadata.stringValue(data, CustomMetadataKey.ChatId);
    this.width = Metadata.intValue(data, CustomMetadataKey.Width);
    this.height = Metadata.intValue(data, CustomMetadataKey.Height);
    this.original_file_type = Metadata.stringValue(data, CustomMetadataKey.Original_file_type);
  }
}

/**
 * Metadata Key.
 *
 * @author k.sumi 2017/09/22
 */
export enum MetadataKey {
  Bucket = 'bucket',
  CacheControl = 'cacheControl',
  ContentDisposition = 'contentDisposition',
  ContentEncoding = 'contentEncoding',
  ContentLanguage = 'contentLanguage',
  ContentType = 'contentType',
  CustomMetadata = 'customMetadata',
  DownloadURLs = 'downloadURLs',
  FullPath = 'fullPath',
  Generation = 'generation',
  Md5Hash = 'md5Hash',
  Metageneration = 'metageneration',
  Name = 'name',
  Size = 'size',
  TimeCreated = 'timeCreated',
  Type = 'type',
  Updated = 'updated'
}

/**
 * Custom metadata key.
 *
 * @author k.sumi 2017/09/22
 */
export enum CustomMetadataKey {
  Owner = 'owner',
  Name = 'name',
  GroupId = 'gid',
  ChatId = 'cid',
  Width = 'width',
  Height = 'height',
  Original_file_type = 'mime_type'
}

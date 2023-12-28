import {JsonConverter, JsonCustomConvert} from 'json2typescript';

/**
 * Date Converter.
 */
@JsonConverter
export class DateConverter implements JsonCustomConvert<Date> {
  // @Override
  serialize(date: Date): any {
    return date.getTime();
  }
  // @Override
  deserialize(unixtime: Number): Date {
    if (!unixtime || unixtime ===  0) {
      return null;
    }
    return new Date(unixtime.valueOf());
  }
}

/**
 * Key Array Converter.
 */
@JsonConverter
export class KeysConverter implements JsonCustomConvert<string[]> {
  // @Override
  serialize(data: string[]): any {
    // unsupported
    return null;
  }
  // @Override
  deserialize(data: any): string[] {
    return Object.keys(data);
  }
}

/**
 * Value Array Converter.
 */
@JsonConverter
export class ValuesConverter implements JsonCustomConvert<string[]> {
  // @Override
  serialize(data: string[]): any {
    // unsupported
    return null;
  }
  // @Override
  deserialize(data: any): string[] {
    const fileIds: string[] = [];
    Object.keys(data).forEach(k => {
      fileIds.push(data[k]);
    });
    return fileIds;
  }
}

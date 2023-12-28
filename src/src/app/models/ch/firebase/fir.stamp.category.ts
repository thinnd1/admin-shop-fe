import {FirBase} from './fir.base';
import {JsonConverter, JsonCustomConvert, JsonObject, JsonProperty} from 'json2typescript';
import {FirStamp} from './fir.stamp';

@JsonConverter
class StampConverter implements JsonCustomConvert<any[]> {
  // @Override
  serialize(data: any[]): any {
    return null;
  }
  // @Override
  deserialize(data: any[]): any[] {
    if (!(typeof {})) {
      return null;
    }
    const stamps: any[] = [];
    Object.keys(data).forEach(k => {
      stamps.push({stampId: k, stamp: data[k]});
    });
    return stamps;
  }
}

/**
 *
 */
@JsonObject
export class FirStampCategory extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static KeyName = 'name';
  private static KeyStamps = 'stamps';

  // Variables
  // --------------------------------------------------------------------------
  @JsonProperty(FirStampCategory.KeyName, String)
  name: string = undefined;

  @JsonProperty(FirStampCategory.KeyStamps, StampConverter, true)
  stamps: any[] = [];

  // Methods
  // --------------------------------------------------------------------------
  // @Override
  updateData(key: string, val: any) {
  }
}


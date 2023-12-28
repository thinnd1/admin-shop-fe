import {FirBase} from './fir.base';
import {JsonObject, JsonProperty} from 'json2typescript';

/**
 *
 */
@JsonObject
export class FirStamp extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static KeyAvailable = 'available';
  private static KeyLargePath = 'large_path';
  private static KeyOrder = 'order';
  private static KeySmallPath = 'small_path';
  private static KeyTitle = 'title';

  // Variables
  // --------------------------------------------------------------------------
  @JsonProperty(FirStamp.KeyAvailable, Boolean)
  available: boolean = undefined;

  @JsonProperty(FirStamp.KeyLargePath, String)
  largePath: string = undefined;

  @JsonProperty(FirStamp.KeyOrder, Number)
  order: number = undefined;

  @JsonProperty(FirStamp.KeySmallPath, String)
  smallPath: string = undefined;

  @JsonProperty(FirStamp.KeyTitle, String)
  title: string = undefined;

  // Methods
  // --------------------------------------------------------------------------
  // @Override
  updateData(key: string, val: any) {
    switch (key) {
      case FirStamp.KeyAvailable:
        this.available = val;
        break;
      case FirStamp.KeyLargePath:
        this.largePath = val;
        break;
      case FirStamp.KeyOrder:
        this.order = val;
        break;
      case FirStamp.KeySmallPath:
        this.smallPath = val;
        break;
      case FirStamp.KeyTitle:
        this.title = val;
        break;
      default:
        break;
    }
  }
}

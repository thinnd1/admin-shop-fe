/**
 * @author k.sumi 2018/03/02
 */
import {FirBase} from '../gr/firebase/fir.base';
import {JsonObject, JsonProperty} from 'json2typescript';
import {DateConverter} from '../../common/converter/firebase.json.converter';

@JsonObject
export class FirUserInformation extends FirBase {

  // Variables
  // --------------------------------------------------------------------------
  /** 既読・未読. */
  @JsonProperty('read', Boolean, true)
  read: boolean = undefined;

  /** 送信時間. */
  @JsonProperty('sentAt', DateConverter, true)
  sentAt: Date = undefined;

  // Override
  // --------------------------------------------------------------------------
  updateData(key: string, val: any) {
    // Ignore
  }
}

/**
 * @author k.sumi 2018/03/01
 */
import {FirBase} from '../gr/firebase/fir.base';
import {JsonObject, JsonProperty} from 'json2typescript';

@JsonObject
export class FirTimeline extends FirBase {

  // Variables
  // --------------------------------------------------------------------------
  /** グループID. */
  @JsonProperty('groupId', String, true)
  groupId: string = undefined;

  /** 記事ID. */
  @JsonProperty('articleId', String, true)
  articleId: string = undefined;

  // Override
  // --------------------------------------------------------------------------
  updateData(key: string, val: any) {
    // Ignore
  }
}

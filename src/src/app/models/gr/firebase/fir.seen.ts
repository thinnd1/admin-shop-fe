import {JsonObject} from 'json2typescript';

/**
 * 既読・未読情報.
 */
@JsonObject
export class FirSeen {
  constructor(public seen: string[], public unseen: string[]) {
  }
}

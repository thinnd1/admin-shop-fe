import {FirBase} from './fir.base';
import {JsonObject, JsonProperty} from 'json2typescript';
import {DateConverter} from '../../../common/converter/firebase.json.converter';

/**
 *
 */
@JsonObject
export class FirRoom extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static KeyDisplayName = 'display_name';
  private static KeyHasMediator = 'hasMediator';
  private static KeyIsNew = 'isNew';
  private static KeyLastMessage = 'last_message';
  private static KeyLastMessageTimestamp = 'last_message_timestamp';
  private static KeyName = 'name';
  private static KeyTimestamp = 'timestamp';
  private static KeyType = 'type';
  private static KeyUnseenCount = 'unseenCount';

  // Variables
  // --------------------------------------------------------------------------
  @JsonProperty(FirRoom.KeyDisplayName, String)
  displayName: string = undefined;

  @JsonProperty(FirRoom.KeyHasMediator, Boolean)
  hasMediator: boolean = undefined;

  @JsonProperty(FirRoom.KeyIsNew, Boolean)
  isNew: boolean = undefined;

  @JsonProperty(FirRoom.KeyLastMessage, String)
  lastMessage: string = undefined;

  @JsonProperty(FirRoom.KeyLastMessageTimestamp, DateConverter)
  lastMessageTimestamp: Date = undefined;

  @JsonProperty(FirRoom.KeyTimestamp, DateConverter)
  timestamp: Date = undefined;

  @JsonProperty(FirRoom.KeyName, String)
  name: string = undefined;

  @JsonProperty(FirRoom.KeyType, String)
  type: RoomType = undefined;

  @JsonProperty(FirRoom.KeyUnseenCount, Number)
  unseenCount: number = undefined;

  // Methods
  // --------------------------------------------------------------------------
  // @Override
  updateData(key: string, val: any) {
    switch (key) {
      case FirRoom.KeyDisplayName:
        this.displayName = val;
        break;
      case FirRoom.KeyHasMediator:
        this.hasMediator = val;
        break;
      case FirRoom.KeyIsNew:
        this.isNew = val;
        break;
      case FirRoom.KeyLastMessage:
        this.lastMessage = val;
        break;
      case FirRoom.KeyLastMessageTimestamp:
        this.lastMessageTimestamp = val;
        break;
      case FirRoom.KeyTimestamp:
        this.timestamp = val;
        break;
      case FirRoom.KeyName:
        this.name = val;
        break;
      case FirRoom.KeyType:
        this.type = val;
        break;
      case FirRoom.KeyUnseenCount:
        this.unseenCount = val;
        break;
      default:
        break;
    }
  }
}
/**
 * Room type.
 */
export enum RoomType {
  Customer = 'CUSTOMER',
  Inside = 'INSIDE',
  Outside = 'OUTSIDE'
}

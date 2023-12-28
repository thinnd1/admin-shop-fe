import {MessageType} from './message.type';

export class MessageSettings {
  public id: string;
  public type: MessageType;
  public text: string;
  public stamp: string;
  public attachment: any;

  constructor() {
    this.type = MessageType.Text;
    this.text = '';
    this.stamp = '';
    this.attachment = {};
  }
}

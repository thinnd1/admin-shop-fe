/**
 * ME0015
 */
export class ListMediatorSendAPISettings {
  public userList: any;
  public mediatorId: string;

  constructor(userList: any, mediatorId: string) {
    this.userList = userList;
    this.mediatorId = mediatorId;
  }
}

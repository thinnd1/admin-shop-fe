/**
 * GR0011
 * Created by thaobtb on 11/02/2017.
 */
export class EditArticleSettings {
  public id: string;
  public contents: string;
  public toUser: any[];
  public attachments: any[];

  constructor() {
    this.id = '';
    this.contents = '';
    this.toUser = [];
    this.attachments = [];
  }
}

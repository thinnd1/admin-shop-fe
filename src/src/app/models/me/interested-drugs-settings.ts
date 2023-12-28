/**
 * ME0020 Dr_関心のある薬剤設定
 */
import {InterestedDrugsItemSettings} from './interested-drugs-item-settings';

export class InterestedDrugsSettings {
  public firstName: string;
  public lastName: string;
  public officeId: string;
  public userId: string;
  public drugs: InterestedDrugsItemSettings[];

  constructor() {
    this.firstName = null;
    this.lastName = null;
    this.officeId = null;
    this.userId = null;
    this.drugs = [];
  }
}

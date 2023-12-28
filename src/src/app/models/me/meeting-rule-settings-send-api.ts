/**
 * ME0023 Dr_面会ルール設定
 */
export class MeetingRuleSettingsSendApi {
  public attachments: any[];
  public removeAttachments: any[];
  public rule: string;
  public officeId: string;
  constructor(officeId: string, rule: string, attachments: any[], removeAttachments: any[]) {
    this.attachments = attachments;
    this.rule = rule;
    this.removeAttachments = removeAttachments;
    this.officeId = officeId;
  }
}

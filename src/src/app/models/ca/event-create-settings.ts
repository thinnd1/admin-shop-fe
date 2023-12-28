/**
 * CA0004 予定の作成
 */
export class EventCreateSettings {
  id: string;
  groupId: string;
  userId: string;
  allDay: boolean;
  start: string;
  end: string;
  meetingPublishType: string;
  publishType: string;
  title: string;
  note: string;
  place: string;
  recursiveOption: string;
  repeatParentId: string;
  repeatRule: string;
}

/**
 * Me0021 初回登録
 */
export class MeetingDemandsInputSettings {
    public userId: string;
    public officeId: string;
    public details: string;
    public meetingDemandIds: any;

    constructor() {
        this.userId = null;
        this.officeId = null;
        this.details = null;
        this.meetingDemandIds = [];
    }
}


export class MeetingIdentifyStatus {
    public officeId: string;
    public userId: string;
    public identifyStatus: string;
    constructor(identifyStatus, officeId, userId) {
        this.identifyStatus = identifyStatus;
        this.officeId = officeId;
        this.userId = userId;
    }
}
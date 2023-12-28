export class MeetingRestriction {
    public officeId: string;
    public userId: string;
    public meetingRestriction: string;
    constructor(meetingRestriction, officeId, userId) {
        this.meetingRestriction = meetingRestriction;
        this.officeId = officeId;
        this.userId = userId;

    }
}
export class EventNoMeeting {
  public end: string;
  public start: string;
  public calendarType: string;
  public backgroundColor: string;
  public borderColor: string;

  constructor(start: string, end: string) {
    this.end = end;
    this.start = start;
    this.calendarType = 'noMeeting';
    this.backgroundColor = '#D8D8D8';
    this.borderColor = 'transparent';
  }
}

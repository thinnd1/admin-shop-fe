export class EventDeleteSettings {
 public id: string;
 public recursiveOption: number;

 constructor(eventId: string, recursiveOption: number) {
   this.id = eventId;
   this.recursiveOption = recursiveOption;
 }
}


import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestMeetingDrComponent } from './request-meeting-dr.component';

describe('RequestMeetingDrComponent', () => {
  let component: RequestMeetingDrComponent;
  let fixture: ComponentFixture<RequestMeetingDrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestMeetingDrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestMeetingDrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

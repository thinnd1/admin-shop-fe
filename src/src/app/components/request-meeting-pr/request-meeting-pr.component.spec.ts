import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestMeetingPrComponent } from './request-meeting-pr.component';

describe('RequestMeetingPrComponent', () => {
  let component: RequestMeetingPrComponent;
  let fixture: ComponentFixture<RequestMeetingPrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestMeetingPrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestMeetingPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameMeetingPageComponent } from './frame-meeting-page.component';

describe('FrameMeetingPageComponent', () => {
  let component: FrameMeetingPageComponent;
  let fixture: ComponentFixture<FrameMeetingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrameMeetingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

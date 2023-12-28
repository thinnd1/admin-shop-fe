import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPopoverComponent } from './staff-popover.component';

describe('StaffPopoverComponent', () => {
  let component: StaffPopoverComponent;
  let fixture: ComponentFixture<StaffPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

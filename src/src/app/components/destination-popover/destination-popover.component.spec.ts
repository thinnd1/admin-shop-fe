import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationPopoverComponent } from './destination-popover.component';

describe('DestinationPopoverComponent', () => {
  let component: DestinationPopoverComponent;
  let fixture: ComponentFixture<DestinationPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DestinationPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DestinationPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

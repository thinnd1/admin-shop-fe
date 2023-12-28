import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupHoverComponent } from './popup-hover.component';

describe('PopupHoverComponent', () => {
  let component: PopupHoverComponent;
  let fixture: ComponentFixture<PopupHoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupHoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupHoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

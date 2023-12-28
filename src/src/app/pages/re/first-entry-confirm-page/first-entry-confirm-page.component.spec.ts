import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstEntryConfirmPageComponent } from './first-entry-confirm-page.component';

describe('FirstEntryConfirmPageComponent', () => {
  let component: FirstEntryConfirmPageComponent;
  let fixture: ComponentFixture<FirstEntryConfirmPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstEntryConfirmPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstEntryConfirmPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

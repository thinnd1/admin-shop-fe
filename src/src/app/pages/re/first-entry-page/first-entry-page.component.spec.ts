import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstEntryPageComponent } from './first-entry-page.component';

describe('FirstEntryPageComponent', () => {
  let component: FirstEntryPageComponent;
  let fixture: ComponentFixture<FirstEntryPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstEntryPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstEntryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

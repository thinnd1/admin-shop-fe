import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffListPageComponent } from './staff-list-page.component';

describe('StaffListPageComponent', () => {
  let component: StaffListPageComponent;
  let fixture: ComponentFixture<StaffListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentSelectComponent } from './department-select.component';

describe('DepartmentSelectCopyComponent', () => {
  let component: DepartmentSelectComponent;
  let fixture: ComponentFixture<DepartmentSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColSubDrComponent } from './col-sub-dr.component';

describe('ColSubDrComponent', () => {
  let component: ColSubDrComponent;
  let fixture: ComponentFixture<ColSubDrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColSubDrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColSubDrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

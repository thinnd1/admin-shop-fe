import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColSubPrComponent } from './col-sub-pr.component';

describe('ColSubPrComponent', () => {
  let component: ColSubPrComponent;
  let fixture: ComponentFixture<ColSubPrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColSubPrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColSubPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrOfficeSelectComponent } from './pr-office-select.component';

describe('PrOfficeSelectComponent', () => {
  let component: PrOfficeSelectComponent;
  let fixture: ComponentFixture<PrOfficeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrOfficeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrOfficeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

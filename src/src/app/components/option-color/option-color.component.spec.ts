import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionColorComponent } from './option-color.component';

describe('OptionColorComponent', () => {
  let component: OptionColorComponent;
  let fixture: ComponentFixture<OptionColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

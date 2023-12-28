import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountUpInputComponent } from './count-up-input.component';

describe('CountUpInputComponent', () => {
  let component: CountUpInputComponent;
  let fixture: ComponentFixture<CountUpInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountUpInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountUpInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

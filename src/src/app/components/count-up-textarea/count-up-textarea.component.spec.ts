import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountUpTextareaComponent } from './count-up-textarea.component';

describe('CountUpTextareaComponent', () => {
  let component: CountUpTextareaComponent;
  let fixture: ComponentFixture<CountUpTextareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountUpTextareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountUpTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

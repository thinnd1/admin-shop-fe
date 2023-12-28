import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringTrimComponent } from './string-trim.component';

describe('StringTrimComponent', () => {
  let component: StringTrimComponent;
  let fixture: ComponentFixture<StringTrimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringTrimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringTrimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

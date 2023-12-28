import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0010PageComponent } from './ph0010-page.component';

describe('Ph0010PageComponent', () => {
  let component: Ph0010PageComponent;
  let fixture: ComponentFixture<Ph0010PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0010PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0010PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

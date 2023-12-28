import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0004PageComponent } from './ph0004-page.component';

describe('Ph0004PageComponent', () => {
  let component: Ph0004PageComponent;
  let fixture: ComponentFixture<Ph0004PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0004PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0004PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0011PageComponent } from './ph0011-page.component';

describe('Ph0011PageComponent', () => {
  let component: Ph0011PageComponent;
  let fixture: ComponentFixture<Ph0011PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0011PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0011PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

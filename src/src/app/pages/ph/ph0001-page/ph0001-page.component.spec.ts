import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0001PageComponent } from './ph0001-page.component';

describe('Ph0001PageComponent', () => {
  let component: Ph0001PageComponent;
  let fixture: ComponentFixture<Ph0001PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0001PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0001PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

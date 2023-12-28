import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0007PageComponent } from './ph0007-page.component';

describe('Ph0007PageComponent', () => {
  let component: Ph0007PageComponent;
  let fixture: ComponentFixture<Ph0007PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0007PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0007PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

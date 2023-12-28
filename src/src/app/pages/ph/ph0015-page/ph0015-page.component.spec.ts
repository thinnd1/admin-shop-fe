import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0015PageComponent } from './ph0015-page.component';

describe('Ph0015PageComponent', () => {
  let component: Ph0015PageComponent;
  let fixture: ComponentFixture<Ph0015PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0015PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0015PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

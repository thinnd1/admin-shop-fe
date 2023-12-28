import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0012PageComponent } from './ph0012-page.component';

describe('Ph0012PageComponent', () => {
  let component: Ph0012PageComponent;
  let fixture: ComponentFixture<Ph0012PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0012PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0012PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

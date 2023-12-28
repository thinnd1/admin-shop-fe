import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0008PageComponent } from './ph0008-page.component';

describe('Ph0008PageComponent', () => {
  let component: Ph0008PageComponent;
  let fixture: ComponentFixture<Ph0008PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0008PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0008PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0021PageComponent } from './ph0021-page.component';

describe('Ph0021PageComponent', () => {
  let component: Ph0021PageComponent;
  let fixture: ComponentFixture<Ph0021PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0021PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0021PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

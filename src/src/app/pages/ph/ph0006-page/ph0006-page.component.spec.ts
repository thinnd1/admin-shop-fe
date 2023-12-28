import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0006PageComponent } from './ph0006-page.component';

describe('Ph0006PageComponent', () => {
  let component: Ph0006PageComponent;
  let fixture: ComponentFixture<Ph0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

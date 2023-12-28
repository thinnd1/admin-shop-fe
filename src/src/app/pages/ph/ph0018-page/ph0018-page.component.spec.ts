import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0018PageComponent } from './ph0018-page.component';

describe('Ph0018PageComponent', () => {
  let component: Ph0018PageComponent;
  let fixture: ComponentFixture<Ph0018PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0018PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0018PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

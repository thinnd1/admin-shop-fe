import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0027PageComponent } from './re0027-page.component';

describe('Re0027PageComponent', () => {
  let component: Re0027PageComponent;
  let fixture: ComponentFixture<Re0027PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0027PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0027PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

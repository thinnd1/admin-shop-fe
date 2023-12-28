import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0022PageComponent } from './re0022-page.component';

describe('Re0022PageComponent', () => {
  let component: Re0022PageComponent;
  let fixture: ComponentFixture<Re0022PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0022PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0022PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

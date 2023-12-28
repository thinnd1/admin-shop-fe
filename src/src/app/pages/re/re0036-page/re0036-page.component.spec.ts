import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0036PageComponent } from './re0036-page.component';

describe('Re0036PageComponent', () => {
  let component: Re0036PageComponent;
  let fixture: ComponentFixture<Re0036PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0036PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0036PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

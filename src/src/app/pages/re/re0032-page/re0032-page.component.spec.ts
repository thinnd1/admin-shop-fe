import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0032PageComponent } from './re0032-page.component';

describe('Re0032PageComponent', () => {
  let component: Re0032PageComponent;
  let fixture: ComponentFixture<Re0032PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0032PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0032PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

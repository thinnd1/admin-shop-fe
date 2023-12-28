import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0026PageComponent } from './re0026-page.component';

describe('Re0026PageComponent', () => {
  let component: Re0026PageComponent;
  let fixture: ComponentFixture<Re0026PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0026PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0026PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0009PageComponent } from './re0009-page.component';

describe('Re0009PageComponent', () => {
  let component: Re0009PageComponent;
  let fixture: ComponentFixture<Re0009PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0009PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0009PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0004PageComponent } from './re0004-page.component';

describe('Re0004PageComponent', () => {
  let component: Re0004PageComponent;
  let fixture: ComponentFixture<Re0004PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0004PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0004PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0012PageComponent } from './re0012-page.component';

describe('Re0012PageComponent', () => {
  let component: Re0012PageComponent;
  let fixture: ComponentFixture<Re0012PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0012PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0012PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Re0034PageComponent } from './re0034-page.component';

describe('Re0034PageComponent', () => {
  let component: Re0034PageComponent;
  let fixture: ComponentFixture<Re0034PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Re0034PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Re0034PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

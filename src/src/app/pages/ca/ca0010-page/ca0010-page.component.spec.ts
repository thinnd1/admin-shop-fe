import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0010PageComponent } from './ca0010-page.component';

describe('Ca0010PageComponent', () => {
  let component: Ca0010PageComponent;
  let fixture: ComponentFixture<Ca0010PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0010PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0010PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0002PageComponent } from './ca0002-page.component';

describe('Ca0002PageComponent', () => {
  let component: Ca0002PageComponent;
  let fixture: ComponentFixture<Ca0002PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0002PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0002PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ca0014PageComponent } from './ca0014-page.component';

describe('Ca0014PageComponent', () => {
  let component: Ca0014PageComponent;
  let fixture: ComponentFixture<Ca0014PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ca0014PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ca0014PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

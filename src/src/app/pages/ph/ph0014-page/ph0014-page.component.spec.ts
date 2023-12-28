import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ph0014PageComponent } from './ph0014-page.component';

describe('Ph0014PageComponent', () => {
  let component: Ph0014PageComponent;
  let fixture: ComponentFixture<Ph0014PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ph0014PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ph0014PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

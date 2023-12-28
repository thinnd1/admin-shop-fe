import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0014PageComponent } from './gr0014-page.component';

describe('Gr0014PageComponent', () => {
  let component: Gr0014PageComponent;
  let fixture: ComponentFixture<Gr0014PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0014PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0014PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

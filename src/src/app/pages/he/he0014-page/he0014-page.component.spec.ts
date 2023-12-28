import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0014PageComponent } from './he0014-page.component';

describe('He0014PageComponent', () => {
  let component: He0014PageComponent;
  let fixture: ComponentFixture<He0014PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0014PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0014PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

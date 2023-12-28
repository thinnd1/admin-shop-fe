import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0015PageComponent } from './he0015-page.component';

describe('He0015PageComponent', () => {
  let component: He0015PageComponent;
  let fixture: ComponentFixture<He0015PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0015PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0015PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

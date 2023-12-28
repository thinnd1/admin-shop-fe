import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0001PageComponent } from './he0001-page.component';

describe('He0001PageComponent', () => {
  let component: He0001PageComponent;
  let fixture: ComponentFixture<He0001PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0001PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0001PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

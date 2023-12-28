import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0007PageComponent } from './he0007-page.component';

describe('He0007PageComponent', () => {
  let component: He0007PageComponent;
  let fixture: ComponentFixture<He0007PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0007PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0007PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

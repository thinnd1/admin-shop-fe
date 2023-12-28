import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0008PageComponent } from './he0008-page.component';

describe('He0008PageComponent', () => {
  let component: He0008PageComponent;
  let fixture: ComponentFixture<He0008PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0008PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0008PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

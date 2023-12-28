import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0002PageComponent } from './he0002-page.component';

describe('He0002PageComponent', () => {
  let component: He0002PageComponent;
  let fixture: ComponentFixture<He0002PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0002PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0002PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

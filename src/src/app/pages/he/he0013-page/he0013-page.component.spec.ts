import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0013PageComponent } from './he0013-page.component';

describe('He0013PageComponent', () => {
  let component: He0013PageComponent;
  let fixture: ComponentFixture<He0013PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0013PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0013PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0010PageComponent } from './he0010-page.component';

describe('He0010PageComponent', () => {
  let component: He0010PageComponent;
  let fixture: ComponentFixture<He0010PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0010PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0010PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

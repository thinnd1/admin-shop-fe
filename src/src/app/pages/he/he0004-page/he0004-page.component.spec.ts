import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0004PageComponent } from './he0004-page.component';

describe('He0004PageComponent', () => {
  let component: He0004PageComponent;
  let fixture: ComponentFixture<He0004PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0004PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0004PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

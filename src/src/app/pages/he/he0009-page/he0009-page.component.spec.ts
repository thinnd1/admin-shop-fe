import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0009PageComponent } from './he0009-page.component';

describe('He0009PageComponent', () => {
  let component: He0009PageComponent;
  let fixture: ComponentFixture<He0009PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0009PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0009PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0006PageComponent } from './he0006-page.component';

describe('He0006PageComponent', () => {
  let component: He0006PageComponent;
  let fixture: ComponentFixture<He0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

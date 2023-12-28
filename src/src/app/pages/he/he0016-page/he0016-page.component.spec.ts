import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0016PageComponent } from './he0016-page.component';

describe('He0016PageComponent', () => {
  let component: He0016PageComponent;
  let fixture: ComponentFixture<He0016PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0016PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0016PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0012PageComponent } from './he0012-page.component';

describe('He0012PageComponent', () => {
  let component: He0012PageComponent;
  let fixture: ComponentFixture<He0012PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0012PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0012PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

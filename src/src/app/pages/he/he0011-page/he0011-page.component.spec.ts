import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0011PageComponent } from './he0011-page.component';

describe('He0011PageComponent', () => {
  let component: He0011PageComponent;
  let fixture: ComponentFixture<He0011PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0011PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0011PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

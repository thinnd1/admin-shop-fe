import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { He0003PageComponent } from './he0003-page.component';

describe('He0003PageComponent', () => {
  let component: He0003PageComponent;
  let fixture: ComponentFixture<He0003PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ He0003PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(He0003PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

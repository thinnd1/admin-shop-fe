import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0008PageComponent } from './gr0008-page.component';

describe('Gr0008PageComponent', () => {
  let component: Gr0008PageComponent;
  let fixture: ComponentFixture<Gr0008PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0008PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0008PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

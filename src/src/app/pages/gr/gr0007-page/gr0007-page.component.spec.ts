import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0007PageComponent } from './gr0007-page.component';

describe('Gr0007PageComponent', () => {
  let component: Gr0007PageComponent;
  let fixture: ComponentFixture<Gr0007PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0007PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0007PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

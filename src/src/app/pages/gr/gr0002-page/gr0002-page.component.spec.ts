import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0002PageComponent } from './gr0002-page.component';

describe('Gr0002PageComponent', () => {
  let component: Gr0002PageComponent;
  let fixture: ComponentFixture<Gr0002PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0002PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0002PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0004PageComponent } from './gr0004-page.component';

describe('Gr0004PageComponent', () => {
  let component: Gr0004PageComponent;
  let fixture: ComponentFixture<Gr0004PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0004PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0004PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

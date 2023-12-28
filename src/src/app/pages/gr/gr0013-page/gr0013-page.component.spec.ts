import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0013PageComponent } from './gr0013-page.component';

describe('Gr0013PageComponent', () => {
  let component: Gr0013PageComponent;
  let fixture: ComponentFixture<Gr0013PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0013PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0013PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

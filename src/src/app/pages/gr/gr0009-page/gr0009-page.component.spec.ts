import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0009PageComponent } from './gr0009-page.component';

describe('Gr0009PageComponent', () => {
  let component: Gr0009PageComponent;
  let fixture: ComponentFixture<Gr0009PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0009PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0009PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

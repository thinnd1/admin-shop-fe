import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0006PageComponent } from './gr0006-page.component';

describe('Gr0006PageComponent', () => {
  let component: Gr0006PageComponent;
  let fixture: ComponentFixture<Gr0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

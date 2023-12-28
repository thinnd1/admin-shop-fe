import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0011PageComponent } from './gr0011-page.component';

describe('Gr0011PageComponent', () => {
  let component: Gr0011PageComponent;
  let fixture: ComponentFixture<Gr0011PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0011PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0011PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

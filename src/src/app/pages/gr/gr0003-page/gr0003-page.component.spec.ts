import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0003PageComponent } from './gr0003-page.component';

describe('Gr0003PageComponent', () => {
  let component: Gr0003PageComponent;
  let fixture: ComponentFixture<Gr0003PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0003PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0003PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Gr0005PageComponent } from './gr0005-page.component';

describe('Gr0005PageComponent', () => {
  let component: Gr0005PageComponent;
  let fixture: ComponentFixture<Gr0005PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gr0005PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gr0005PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

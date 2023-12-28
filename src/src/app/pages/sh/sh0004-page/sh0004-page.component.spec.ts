import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0004PageComponent } from './sh0004-page.component';

describe('Sh0004PageComponent', () => {
  let component: Sh0004PageComponent;
  let fixture: ComponentFixture<Sh0004PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0004PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0004PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

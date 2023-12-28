import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0001PageComponent } from './sh0001-page.component';

describe('Sh0001PageComponent', () => {
  let component: Sh0001PageComponent;
  let fixture: ComponentFixture<Sh0001PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0001PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0001PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

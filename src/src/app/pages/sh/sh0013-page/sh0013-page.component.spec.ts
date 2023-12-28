import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0013PageComponent } from './sh0013-page.component';

describe('Sh0013PageComponent', () => {
  let component: Sh0013PageComponent;
  let fixture: ComponentFixture<Sh0013PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0013PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0013PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

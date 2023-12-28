import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0009PageComponent } from './sh0009-page.component';

describe('Sh0009PageComponent', () => {
  let component: Sh0009PageComponent;
  let fixture: ComponentFixture<Sh0009PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0009PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0009PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

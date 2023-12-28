import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0011PageComponent } from './sh0011-page.component';

describe('Sh0011PageComponent', () => {
  let component: Sh0011PageComponent;
  let fixture: ComponentFixture<Sh0011PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0011PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0011PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

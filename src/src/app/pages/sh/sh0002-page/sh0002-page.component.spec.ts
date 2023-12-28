import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0002PageComponent } from './sh0002-page.component';

describe('Sh0002PageComponent', () => {
  let component: Sh0002PageComponent;
  let fixture: ComponentFixture<Sh0002PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0002PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0002PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

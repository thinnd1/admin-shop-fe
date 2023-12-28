import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0007PageComponent } from './sh0007-page.component';

describe('Sh0007PageComponent', () => {
  let component: Sh0007PageComponent;
  let fixture: ComponentFixture<Sh0007PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0007PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0007PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

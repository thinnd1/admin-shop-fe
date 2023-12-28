import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0012PageComponent } from './sh0012-page.component';

describe('Sh0012PageComponent', () => {
  let component: Sh0012PageComponent;
  let fixture: ComponentFixture<Sh0012PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0012PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0012PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

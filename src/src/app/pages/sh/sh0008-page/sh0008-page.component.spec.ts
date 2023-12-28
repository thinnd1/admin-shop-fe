import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0008PageComponent } from './sh0008-page.component';

describe('Sh0008PageComponent', () => {
  let component: Sh0008PageComponent;
  let fixture: ComponentFixture<Sh0008PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0008PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0008PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

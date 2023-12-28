import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh0006PageComponent } from './sh0006-page.component';

describe('Sh0006PageComponent', () => {
  let component: Sh0006PageComponent;
  let fixture: ComponentFixture<Sh0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sh0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sh0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0007PageComponent } from './me0007-page.component';

describe('Me0007PageComponent', () => {
  let component: Me0007PageComponent;
  let fixture: ComponentFixture<Me0007PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0007PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0007PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

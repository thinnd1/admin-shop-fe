import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0003PageComponent } from './me0003-page.component';

describe('Me0003PageComponent', () => {
  let component: Me0003PageComponent;
  let fixture: ComponentFixture<Me0003PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0003PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0003PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0023PageComponent } from './me0023-page.component';

describe('Me0023PageComponent', () => {
  let component: Me0023PageComponent;
  let fixture: ComponentFixture<Me0023PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0023PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0023PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

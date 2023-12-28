import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0048PageComponent } from './me0048-page.component';

describe('Me0048PageComponent', () => {
  let component: Me0048PageComponent;
  let fixture: ComponentFixture<Me0048PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0048PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0048PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

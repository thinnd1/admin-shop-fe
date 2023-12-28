import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Me0028PageComponent } from './me0028-page.component';

describe('Me0028PageComponent', () => {
  let component: Me0028PageComponent;
  let fixture: ComponentFixture<Me0028PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Me0028PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Me0028PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

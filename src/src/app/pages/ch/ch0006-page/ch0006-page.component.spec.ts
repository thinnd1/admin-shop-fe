import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ch0006PageComponent } from './ch0006-page.component';

describe('Ch0006PageComponent', () => {
  let component: Ch0006PageComponent;
  let fixture: ComponentFixture<Ch0006PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ch0006PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ch0006PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

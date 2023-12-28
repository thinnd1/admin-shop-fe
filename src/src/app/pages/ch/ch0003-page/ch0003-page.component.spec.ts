import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ch0003PageComponent } from './ch0003-page.component';

describe('Ch0003PageComponent', () => {
  let component: Ch0003PageComponent;
  let fixture: ComponentFixture<Ch0003PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ch0003PageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ch0003PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ch0007PageComponent } from './ch0007-page.component';

describe('Ch0007PageComponent', () => {
  let component: Ch0007PageComponent;
  let fixture: ComponentFixture<Ch0007PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ch0007PageComponent ]
    })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ch0007PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

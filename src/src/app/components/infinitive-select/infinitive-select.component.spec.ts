import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {InfinitiveSelectComponent} from './infinitive-select.component';


describe('InfinitiveSelectComponent', () => {
  let component: InfinitiveSelectComponent;
  let fixture: ComponentFixture<InfinitiveSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfinitiveSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfinitiveSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

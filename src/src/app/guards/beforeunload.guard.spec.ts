import { TestBed, async, inject } from '@angular/core/testing';

import { BeforeunloadGuard } from './beforeunload.guard';

describe('BeforeunloadGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BeforeunloadGuard]
    });
  });

  it('should ...', inject([BeforeunloadGuard], (guard: BeforeunloadGuard) => {
    expect(guard).toBeTruthy();
  }));
});

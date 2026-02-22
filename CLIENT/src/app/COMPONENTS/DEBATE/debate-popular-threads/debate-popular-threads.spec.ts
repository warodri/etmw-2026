import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebatePopularThreads } from './debate-popular-threads';

describe('DebatePopularThreads', () => {
  let component: DebatePopularThreads;
  let fixture: ComponentFixture<DebatePopularThreads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebatePopularThreads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebatePopularThreads);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

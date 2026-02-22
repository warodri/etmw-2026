import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebateRecentThreads } from './debate-recent-threads';

describe('DebateRecentThreads', () => {
  let component: DebateRecentThreads;
  let fixture: ComponentFixture<DebateRecentThreads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebateRecentThreads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebateRecentThreads);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

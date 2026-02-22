import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebateComments } from './debate-comments';

describe('DebateComments', () => {
  let component: DebateComments;
  let fixture: ComponentFixture<DebateComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebateComments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebateComments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebateCommentCard } from './debate-comment-card';

describe('DebateCommentCard', () => {
  let component: DebateCommentCard;
  let fixture: ComponentFixture<DebateCommentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebateCommentCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebateCommentCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

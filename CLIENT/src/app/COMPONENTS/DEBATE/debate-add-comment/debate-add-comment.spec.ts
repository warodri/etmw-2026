import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebateAddComment } from './debate-add-comment';

describe('DebateAddComment', () => {
  let component: DebateAddComment;
  let fixture: ComponentFixture<DebateAddComment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebateAddComment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebateAddComment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

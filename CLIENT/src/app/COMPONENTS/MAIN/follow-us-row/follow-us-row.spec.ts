import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUsRow } from './follow-us-row';

describe('FollowUsRow', () => {
  let component: FollowUsRow;
  let fixture: ComponentFixture<FollowUsRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FollowUsRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowUsRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

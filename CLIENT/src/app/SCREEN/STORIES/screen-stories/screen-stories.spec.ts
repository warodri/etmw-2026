import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenStories } from './screen-stories';

describe('ScreenStories', () => {
  let component: ScreenStories;
  let fixture: ComponentFixture<ScreenStories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenStories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenStories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

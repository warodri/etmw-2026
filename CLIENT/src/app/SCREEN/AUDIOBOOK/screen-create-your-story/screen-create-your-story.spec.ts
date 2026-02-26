import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenCreateYourStory } from './screen-create-your-story';

describe('ScreenCreateYourStory', () => {
  let component: ScreenCreateYourStory;
  let fixture: ComponentFixture<ScreenCreateYourStory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenCreateYourStory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenCreateYourStory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

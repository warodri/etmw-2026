import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenMyFavsAndBookmarks } from './screen-my-favs-and-bookmarks';

describe('ScreenMyFavsAndBookmarks', () => {
  let component: ScreenMyFavsAndBookmarks;
  let fixture: ComponentFixture<ScreenMyFavsAndBookmarks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenMyFavsAndBookmarks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenMyFavsAndBookmarks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

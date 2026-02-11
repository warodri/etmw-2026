import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryWithAudiobooks } from './category-with-audiobooks';

describe('CategoryWithAudiobooks', () => {
  let component: CategoryWithAudiobooks;
  let fixture: ComponentFixture<CategoryWithAudiobooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoryWithAudiobooks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryWithAudiobooks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

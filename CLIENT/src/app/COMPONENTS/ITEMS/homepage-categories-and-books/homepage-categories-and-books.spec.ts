import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageCategoriesAndBooks } from './homepage-categories-and-books';

describe('HomepageCategoriesAndBooks', () => {
  let component: HomepageCategoriesAndBooks;
  let fixture: ComponentFixture<HomepageCategoriesAndBooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomepageCategoriesAndBooks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomepageCategoriesAndBooks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

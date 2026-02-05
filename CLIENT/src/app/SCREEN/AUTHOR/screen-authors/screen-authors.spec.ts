import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenAuthors } from './screen-authors';

describe('ScreenAuthors', () => {
  let component: ScreenAuthors;
  let fixture: ComponentFixture<ScreenAuthors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenAuthors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenAuthors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

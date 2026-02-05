import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenSearch } from './screen-search';

describe('ScreenSearch', () => {
  let component: ScreenSearch;
  let fixture: ComponentFixture<ScreenSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenTutorials } from './screen-tutorials';

describe('ScreenTutorials', () => {
  let component: ScreenTutorials;
  let fixture: ComponentFixture<ScreenTutorials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenTutorials]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenTutorials);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

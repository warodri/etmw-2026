import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenPlayer } from './screen-player';

describe('ScreenPlayer', () => {
  let component: ScreenPlayer;
  let fixture: ComponentFixture<ScreenPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

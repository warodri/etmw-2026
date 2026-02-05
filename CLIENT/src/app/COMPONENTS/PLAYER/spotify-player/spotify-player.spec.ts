import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyPlayer } from './spotify-player';

describe('SpotifyPlayer', () => {
  let component: SpotifyPlayer;
  let fixture: ComponentFixture<SpotifyPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotifyPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

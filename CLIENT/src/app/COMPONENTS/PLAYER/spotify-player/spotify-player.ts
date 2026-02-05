import { Component } from '@angular/core';
import { ScreenPlayer } from '../../../SCREEN/PLAYER/screen-player/screen-player';

@Component({
  selector: 'app-spotify-player',
  standalone: false,
  templateUrl: './spotify-player.html',
  styleUrl: './spotify-player.css',
})
export class SpotifyPlayer extends ScreenPlayer {

}

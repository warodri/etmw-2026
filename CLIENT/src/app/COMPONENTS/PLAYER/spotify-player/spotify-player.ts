import { Component, OnInit, signal } from '@angular/core';
import { ScreenPlayer } from '../../../SCREEN/PLAYER/screen-player/screen-player';

@Component({
    selector: 'app-spotify-player',
    standalone: false,
    templateUrl: './spotify-player.html',
    styleUrl: './spotify-player.css',
})
export class SpotifyPlayer extends ScreenPlayer implements OnInit {

    coverFile = signal<string | null>(null);

    override ngOnInit(): void {
        super.ngOnInit();
    }

    override getAudiobookById(callback: any) {
        super.getAudiobookById(() => {
            this.coverFile.set(this.getCoverUrl());
            super.getListeningProgress(() => {
                if (callback) callback();
            })
        });
    }
}

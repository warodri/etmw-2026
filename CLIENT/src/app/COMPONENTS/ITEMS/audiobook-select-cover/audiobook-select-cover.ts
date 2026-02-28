import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-audiobook-select-cover',
    standalone: false,
    templateUrl: './audiobook-select-cover.html',
    styleUrl: './audiobook-select-cover.css',
})
export class AudiobookSelectCover implements OnInit {

    @Output() onConverSelected = new EventEmitter<File>();

    language: 'en' | 'es' = 'en';

    constructor() {}

    ngOnInit(): void {
        
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }

    coverSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.onConverSelected.emit(file)
        }
    }

}

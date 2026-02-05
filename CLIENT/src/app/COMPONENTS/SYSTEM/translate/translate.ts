import { Component, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-translate',
    standalone: false,
    template: `<span [innerHTML]="getTranslation()"></span>`
})
export class Translate {
    en = input<string>('');
    es = input<string>('');

    constructor(private sanitizer: DomSanitizer) {}

    getTranslation(): SafeHtml {
        const browserLang = navigator.language.toLowerCase();
        const isSpanish = browserLang.startsWith('es');

        let text = '';
        if (isSpanish && this.es()) {
            text = this.es();
        } else {
            text = this.en();
        }

        return this.sanitizer.sanitize(1, text) || '';
    }
}
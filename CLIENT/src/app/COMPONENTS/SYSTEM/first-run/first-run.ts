import { Component, OnInit, signal } from '@angular/core';
import { LocalStorageService } from '../../../SERVICES/local-storage.service';

@Component({
    selector: 'app-first-run',
    standalone: false,
    templateUrl: './first-run.html',
    styleUrl: './first-run.css',
})
export class FirstRun implements OnInit {

    showCookies = signal<boolean>(false);

    constructor(
        private ls: LocalStorageService
    ) {}

    ngOnInit(): void {
        const c = this.ls.getTag('etmw2026_cookies');
        if (!c) this.showCookies.set(true)
    }

    setCookies() {
        this.ls.storeTag('etmw2026_cookies', '1')
        this.showCookies.set(false)
    }
}

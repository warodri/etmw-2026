import { Component, EventEmitter, OnInit, signal } from '@angular/core';
import { ToastService } from '../../../SERVICES/toast';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
    standalone: false
})
export class ToastComponent implements OnInit {

    message = signal<string | null>(null);

    //  Flags
    showUnauthorisedMessages = false;

    constructor(
        public toast: ToastService
    ) { }

    ngOnInit(): void {
        this.checkNewMessages();
    }

    toggleToast() {
        this.message.set(null);
    }

    checkNewMessages() {
        const next = this.toast.pop();

        if (next) {
            if (
                !this.showUnauthorisedMessages &&
                next.toLowerCase().includes('unauthorised')
            ) {
                // skip
            } else {
                this.message.set(next);
                setTimeout(() => {
                    this.message.set(null);
                    this.checkAgain();
                }, 3000);
                return;
            }
        }

        this.checkAgain();
    }

    checkAgain() {
        setTimeout(() => {
            this.checkNewMessages();
        }, 100)
    }

}
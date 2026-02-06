import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ToastService {

    private _messages = signal<string[]>([]);
    messages = this._messages.asReadonly();

    show(message: string) {
        this._messages.update(list => [...list, message]);
    }

    pop(): string | null {
        const list = this._messages();
        if (list.length === 0) return null;

        const [first, ...rest] = list;
        this._messages.set(rest);
        return first;
    }

    getMessageErrorUnexpected() {
        return 'There was an unexpected error. Please try again.'
    }
}

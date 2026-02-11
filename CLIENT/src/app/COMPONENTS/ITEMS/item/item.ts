import { Component, Input } from '@angular/core';
import { AudiobookModel } from '../../../models/audiobook';

@Component({
    selector: 'app-item',
    standalone: false,
    templateUrl: './item.html',
    styleUrl: './item.css',
})
export class Item {

    @Input() audiobook: AudiobookModel | null = null;
    @Input() template: 'default' | 'md' | 'large' | 'detail' = 'default';

}

import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-item',
    standalone: false,
    templateUrl: './item.html',
    styleUrl: './item.css',
})
export class Item {

    @Input() template: 'default' | 'md' | 'large' | 'detail' = 'default';

}

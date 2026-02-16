import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CategoryModel } from '../../../models/categories';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';

@Component({
    selector: 'app-categories',
    standalone: false,
    templateUrl: './categories.html',
    styleUrl: './categories.css',
})
export class Categories implements OnInit {

    @Output() onCategorySelected = new EventEmitter<CategoryModel>();

    categories = signal<Array<CategoryModel>>([]);

    constructor(
        private iAudiobook: InternetAudiobookService
    ) {}

    ngOnInit(): void {
        this.getCategories();
    }

    getCategories() {
        this.iAudiobook.getAllCategories((response: any) => {
            if (response && response.success) {
                const a = [];
                for (let item of response.categories) {
                    if (!item.parentId) {
                        a.push(item)
                    }
                }
                this.categories.set(a || []);
            }
        })
    }

    select(item: CategoryModel) {
        this.onCategorySelected.emit(item)
    }

}

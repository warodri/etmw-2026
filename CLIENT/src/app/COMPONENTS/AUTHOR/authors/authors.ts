import { Component, OnInit, signal } from '@angular/core';
import { InternetAuthorService } from '../../../SERVICES/internet-author.service';
import { AuthorModel } from '../../../models/author';

@Component({
    selector: 'app-authors',
    standalone: false,
    templateUrl: './authors.html',
    styleUrl: './authors.css',
})
export class Authors implements OnInit {

    latestAuthors = signal<AuthorModel[]>([])

    constructor(
        private iAuthor: InternetAuthorService,
    ) {}

    ngOnInit(): void {
        this.getLatestAuthors();
    }

    getLatestAuthors() {
        this.iAuthor.getLatestAuthors((response: any) => {
            console.log('getLatestAuthors', response);
            if (response && response.success) {
                this.latestAuthors.set(response.authors)
            }
        })
    }

}

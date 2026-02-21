import { Component, OnInit, signal } from '@angular/core';
import { InternetAuthorService } from '../../../SERVICES/internet-author.service';
import { AuthorModel } from '../../../models/author';
import { Router } from '@angular/router';

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
        private router: Router
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

    gotoAuthor(id: string) {
        this.router.navigate(['app/search/author', id])
    }

}

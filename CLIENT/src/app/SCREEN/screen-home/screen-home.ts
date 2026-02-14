import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilClass } from '../../utils/utils';
import { InternetAudiobookService } from '../../SERVICES/interent-audiobook.service';
import { AudiobookModel } from '../../models/audiobook';
import { InternetAuthorService } from '../../SERVICES/internet-author.service';
import { AuthorModel } from '../../models/author';

@Component({
    selector: 'app-screen-home',
    standalone: false,
    templateUrl: './screen-home.html',
    styleUrl: './screen-home.css',
})
export class ScreenHome implements OnInit {

    contactForm = signal({
        name: '',
        email: '',
        userType: '',
        subject: '',
        message: ''
    });
    
    categories = signal([{
        label: 'Psychology',
        emoji: '🧠'
    }, {
        label: 'Technology',
        emoji: '💻'
    }, {
        label: 'Health',
        emoji: '🍎'
    }, {
        label: 'Finance',
        emoji: '💰'
    }, {
        label: 'Travel',
        emoji: '✈️'
    }])

    
    latestAudiobooks = signal<AudiobookModel[]>([])
    latestAuthors = signal<AuthorModel[]>([])

    constructor(
        private router: Router,
        private iAudiobook: InternetAudiobookService,
        private iAuthor: InternetAuthorService,
    ) {}

    ngOnInit() {
        this.getLatest();
        this.detectRegion();
        this.getLatestAuthors();
    }

    getLatest() {
        this.iAudiobook.audiobookFind(null, null, [], [], true, false, true, [], 4, 0, (response: any) => {
            console.log('audiobookFind', response);
            if (response && response.success) {
                this.latestAudiobooks.set(response.audiobooks)
            }
        })
    }

    getLatestAuthors() {
        this.iAuthor.getLatestAuthors((response: any) => {
            console.log('getLatestAuthors', response);
            if (response && response.success) {
                this.latestAuthors.set(response.authors)
            }
        })
    }

    private detectRegion() {
        const regionInfo = UtilClass.detectRegion();        
        if (regionInfo.region == 'latam') {

        }        
        else if (regionInfo.region == 'us') {

        } 
        else if (regionInfo.region == 'uk') {

        } 
        else {

        }
    }

    scrollToId(id: string) {
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    gotoApp() {
        this.router.navigate(['app'])
    }
    
    gotoExploreAllAudiobooks() {
        this.router.navigate(['app/search'])
    }
   
    gotoSeeAllAuthors() {
        this.router.navigate(['app/authors'])
    }


}

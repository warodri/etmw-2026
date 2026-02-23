import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';

@Component({
    selector: 'app-resume-payment-warning',
    standalone: false,
    templateUrl: './resume-payment-warning.html',
    styleUrl: './resume-payment-warning.css',
})
export class ResumePaymentWarning implements OnInit {

    showPendingAudiobooks = signal<boolean>(false);

    constructor(
        private router: Router,
        private iAudiobook: InternetAudiobookService
    ) {}

    ngOnInit(): void {
        this.checkPendingAudiobooks();    
    }

    checkPendingAudiobooks() {
        this.iAudiobook.audiobookGetPendingPayments((response: any) => {
            if (response && response.success && response.audiobooks) {
                if (Array.isArray(response.audiobooks) && response.audiobooks.length > 0) {
                    this.showPendingAudiobooks.set(true);
                }
            }
        })
    }

    gotoPendingPayment() {
        this.router.navigate(['app/audiobooks/payment/pending'])
    }


}

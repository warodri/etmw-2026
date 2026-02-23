import { Component, OnInit, signal } from '@angular/core';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { UserModel } from '../../../models/user';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { AudiobookModel } from '../../../models/audiobook';
import { ToastService } from '../../../SERVICES/toast';
import { Router } from '@angular/router';
import { UtilClass } from '../../../utils/utils';
import { LANGUAGE_MAP, REGION_MAP } from '../../../DATA/country-list';

@Component({
    selector: 'app-screen-resume-payment',
    standalone: false,
    templateUrl: './screen-resume-payment.html',
    styleUrl: './screen-resume-payment.css',
})
export class ScreenResumePayment implements OnInit {

    myUser = signal<UserModel | null>(null);
    pendingPaymentAudioboks = signal<AudiobookModel[]>([]);
    selectedAudiobook = signal<AudiobookModel | null>(null);
    selectedCurrency = signal<string>('$');
    acceptedTerms = false;
    working = signal<boolean>(false);

    constructor(
        private iAudiobooks: InternetAudiobookService,
        private iUser: InternetUserService,
        private toast: ToastService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.detectRegion();
        this.loadMyUser(() => {
            this.getPendingPayments();
        })
    }

    loadMyUser(callback: any) {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response)
            if (response && response.success) {
                this.myUser.set(response.user);
            }
            callback();
        })
    }

    getPendingPayments() {
        this.iAudiobooks.audiobookGetPendingPayments((response: any) => {
            console.log('audiobookGetPendingPayments', response);
            if (response && response.success) {
                const pending = (response.audiobooks || []).filter((a: AudiobookModel) => !a.paymentCompleted);
                this.pendingPaymentAudioboks.set(pending);
                if (this.selectedAudiobook()) {
                    const selectedId = this.selectedAudiobook()?._id;
                    const updatedSelected = pending.find((a: AudiobookModel) => a._id === selectedId) || null;
                    this.selectedAudiobook.set(updatedSelected);
                }
            }
        })
    }

    archiveAudiobook(id: string) {
        this.iAudiobooks.audiobookArchive(id, (response: any) => {
            console.log('audiobookArchive', response);
            if (response && response.success) {
                this.getPendingPayments();
                if (this.selectedAudiobook()?._id === id) {
                    this.backToList();
                }
            } else {
                this.toast.show(response.message);
            }
        })
    }

    selectAudiobook(audiobook: AudiobookModel) {
        this.selectedAudiobook.set(audiobook);
        this.acceptedTerms = false;
    }

    backToList() {
        this.selectedAudiobook.set(null);
        this.acceptedTerms = false;
    }

    resumePaymentSelected() {
        const audiobook = this.selectedAudiobook();
        if (!audiobook) return;
        if (!this.acceptedTerms) {
            this.toast.show('Please accept terms and conditions');
            return;
        }
        const total = Number(audiobook.totalPrice || 0);
        if (total <= 0) {
            this.toast.show('This audiobook does not require payment.');
            return;
        }
        this.working.set(true);
        this.iAudiobooks.createStripeCheckout(audiobook._id, this.selectedCurrency(), total, (response: any) => {
            this.working.set(false);
            if (response && response.success && response.checkoutUrl) {
                window.location.href = response.checkoutUrl;
            } else {
                this.toast.show(response?.message || 'Error creating payment session');
            }
        });
    }

    detectRegion() {
        const regionInfo = UtilClass.detectRegion();
        this.selectedCurrency.set(regionInfo.currency || '$');
    }

    getLanguageName(code: string): string {
        if (!code) return 'N/A';
        const languageMap: Record<string, string> = LANGUAGE_MAP as Record<string, string>;
        if (!code.includes('-')) {
            return languageMap[code] || code;
        }
        return this.getLocaleLabel(code);
    }

    getLocaleLabel(code: string): string {
        const [lang, region] = (code || '').split('-');
        if (!lang) return code || 'N/A';
        const languageMap: Record<string, string> = LANGUAGE_MAP as Record<string, string>;
        const regionMap: Record<string, string> = REGION_MAP as Record<string, string>;
        const languageName = languageMap[lang] || lang;
        const regionName = region ? (regionMap[region] || region) : '';
        return region ? `${languageName} (${regionName})` : languageName;
    }

    getUploadMethodLabel(uploadMethod: string): string {
        if (uploadMethod === 'digital') return 'Digital Upload';
        if (uploadMethod === 'mail') return 'Physical Mail';
        return 'N/A';
    }

    getUploadFileLabel(audiobook: AudiobookModel): string {
        if (!audiobook || !audiobook.file) return 'No file metadata';
        if (typeof audiobook.file === 'string') return audiobook.file;
        return (
            audiobook.file.originalname ||
            audiobook.file.name ||
            audiobook.file.filename ||
            audiobook.file.key ||
            'Uploaded file'
        );
    }

    getTotalPriceLabel(audiobook: AudiobookModel): string {
        const total = Number(audiobook.totalPrice || 0);
        return `${this.selectedCurrency()}${total}`;
    }

    goBack() {
        this.router.navigate(['app']);
    }

}

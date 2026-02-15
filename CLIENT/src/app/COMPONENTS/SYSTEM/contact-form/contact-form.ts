import { Component, Input, signal } from '@angular/core';
import { InternetService } from '../../../SERVICES/internet.service';
import { ToastService } from '../../../SERVICES/toast';

@Component({
    selector: 'app-contact-form',
    standalone: false,
    templateUrl: './contact-form.html',
    styleUrl: './contact-form.css',
})
export class ContactForm {

    @Input() sector: 'website' | 'support' = 'website';

    contactForm = signal({
        name: '',
        email: '',
        userType: '',
        subject: '',
        message: '',
        issueType: '',
        platform: '',
        device: '',
        appVersion: '',
        audiobookId: '',
        chapterNumber: '',
        paymentId: ''
    });

    constructor(
        private internet: InternetService,
        private toast: ToastService
    ) {}

    sendForm() {
        const form = this.contactForm();
        const name = form.name.trim();
        const email = form.email.trim();
        const subject = form.subject.trim();
        const message = form.message.trim();
        const isSupport = this.sector === 'support';

        if (!name || !email || !subject || !message) {
            this.toast.show('Please complete all required fields.');
            return;
        }
        if (isSupport && !form.issueType) {
            this.toast.show('Please select an issue type.');
            return;
        }

        this.internet.sendContactForm(this.sector, {
            name,
            email,
            userType: form.userType || '',
            subject,
            message,
            issueType: form.issueType || '',
            platform: form.platform || '',
            device: form.device || '',
            appVersion: form.appVersion || '',
            audiobookId: form.audiobookId || '',
            chapterNumber: form.chapterNumber || '',
            paymentId: form.paymentId || ''
        }, (response: any) => {
            if (response && response.success) {
                this.toast.show('Thanks for your contact!')
                this.contactForm.set({
                    name: '',
                    email: '',
                    userType: '',
                    subject: '',
                    message: '',
                    issueType: '',
                    platform: '',
                    device: '',
                    appVersion: '',
                    audiobookId: '',
                    chapterNumber: '',
                    paymentId: ''
                });
            } else {
                this.toast.show(this.toast.getMessageErrorUnexpected());
            }
        })
    }

}

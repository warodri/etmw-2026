import { Component, Input, OnInit, signal } from '@angular/core';
import { InternetService } from '../../../SERVICES/internet.service';
import { ToastService } from '../../../SERVICES/toast';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-contact-form',
    standalone: false,
    templateUrl: './contact-form.html',
    styleUrl: './contact-form.css',
})
export class ContactForm implements OnInit {

    @Input() sector: 'website' | 'support' = 'website';
    language: 'en' | 'es' = 'en';

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

    ngOnInit() {
        this.language = LangUtils.detectLanguage();
    }

    sendForm() {
        const form = this.contactForm();
        const name = form.name.trim();
        const email = form.email.trim();
        const subject = form.subject.trim();
        const message = form.message.trim();
        const isSupport = this.sector === 'support';

        if (!name || !email || !subject || !message) {
            this.toast.show(this.tr('Please complete all required fields.', 'Por favor completa todos los campos obligatorios.'));
            return;
        }
        if (isSupport && !form.issueType) {
            this.toast.show(this.tr('Please select an issue type.', 'Por favor selecciona un tipo de problema.'));
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
                this.toast.show(this.tr('Thanks for your contact!', 'Gracias por contactarnos!'))
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

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }

}

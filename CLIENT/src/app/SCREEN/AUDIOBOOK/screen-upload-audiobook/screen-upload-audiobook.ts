import { Component } from '@angular/core';

@Component({
    selector: 'app-screen-upload-audiobook',
    standalone: false,
    templateUrl: './screen-upload-audiobook.html',
    styleUrl: './screen-upload-audiobook.css',
})
export class ScreenUploadAudiobook {
    currentStep = 1;
    steps = [
        { number: 1, label: 'Pricing' },
        { number: 2, label: 'Upload' },
        { number: 3, label: 'Configure' },
        { number: 4, label: 'Review' }
    ];

    // Step 1: Referral & Pricing
    referralCode = '';
    referralValid: boolean | null = null;
    showPartnersModal = false;

    partners = [
        {
            name: 'Writers Guild International',
            description: 'Professional writers association',
            website: 'https://example.com/wgi'
        },
        {
            name: 'Independent Publishers Alliance',
            description: 'Supporting indie authors worldwide',
            website: 'https://example.com/ipa'
        },
        {
            name: 'BookLovers Community',
            description: 'Global reading community',
            website: 'https://example.com/booklovers'
        },
        {
            name: 'Literary Circle Network',
            description: 'Connect with fellow authors',
            website: 'https://example.com/lcn'
        }
    ];

    // Step 2: Upload Method
    uploadMethod: 'digital' | 'mail' | null = null;
    uploadedFile: File | null = null;

    // Step 3: Configuration
    showAdvanced = false;
    bookConfig = {
        sourceLanguage: '',
        targetLanguage: '',
        voiceId: '',
        useExpression: false,
        speechRate: '1.0',
        stability: 50,
        clarity: 75,
        title: '',
        authorName: '',
        description: '',
        categories: [] as string[]
    };

    availableLanguages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
        { code: 'pl', name: 'Polish', flag: '🇵🇱' },
        { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' },
        { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' }
    ];

    standardVoices = [
        {
            id: 'voice-1',
            name: 'Rachel',
            gender: 'Female',
            accent: 'American',
            sampleUrl: 'https://example.com/sample1.mp3',
            isPremium: false
        },
        {
            id: 'voice-2',
            name: 'Daniel',
            gender: 'Male',
            accent: 'British',
            sampleUrl: 'https://example.com/sample2.mp3',
            isPremium: false
        },
        {
            id: 'voice-3',
            name: 'Sophia',
            gender: 'Female',
            accent: 'Australian',
            sampleUrl: 'https://example.com/sample3.mp3',
            isPremium: false
        },
        {
            id: 'voice-4',
            name: 'Michael',
            gender: 'Male',
            accent: 'American',
            sampleUrl: 'https://example.com/sample4.mp3',
            isPremium: false
        }
    ];

    availableCategories = [
        'Literary Fiction',
        'Science Fiction',
        'Fantasy',
        'Mystery',
        'Thriller',
        'Romance',
        'Biography',
        'Self-Help',
        'Historical Fiction',
        'Horror'
    ];

    // Step 4: Review & Submit
    acceptedTerms = false;
    showTermsModal = false;

    // Progress calculation
    getProgressPercent(): number {
        return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
    }

    // Step navigation
    nextStep() {
        if (this.currentStep < 5) {
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    // Step 1: Referral
    validateReferralCode() {
        // Simulate validation
        if (this.referralCode.length > 0) {
            this.referralValid = null;
        }
    }

    applyReferralCode() {
        // Simulate API call
        setTimeout(() => {
            this.referralValid = this.referralCode.toLowerCase() === 'partner2024';
        }, 500);
    }

    showPartners() {
        this.showPartnersModal = true;
    }

    closePartners() {
        this.showPartnersModal = false;
    }

    // Step 2: Upload
    selectUploadMethod(method: 'digital' | 'mail') {
        this.uploadMethod = method;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.uploadedFile = file;
        }
    }

    removeFile() {
        this.uploadedFile = null;
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    canProceedFromStep2(): boolean {
        if (this.uploadMethod === 'digital') {
            return this.uploadedFile !== null;
        } else if (this.uploadMethod === 'mail') {
            return true;
        }
        return false;
    }

    // Step 3: Configuration
    selectVoice(voiceId: string) {
        this.bookConfig.voiceId = voiceId;
    }

    playVoiceSample(event: Event, sampleUrl: string) {
        event.stopPropagation();
        console.log('Play sample:', sampleUrl);
        // Implement audio playback
    }

    showPremiumVoices() {
        console.log('Show premium voices modal');
        // Open modal with premium voice options
    }

    toggleCategory(category: string) {
        const index = this.bookConfig.categories.indexOf(category);
        if (index > -1) {
            this.bookConfig.categories.splice(index, 1);
        } else {
            if (this.bookConfig.categories.length < 3) {
                this.bookConfig.categories.push(category);
            }
        }
    }

    calculateBasePrice(): number {
        if (this.referralValid) return 0;
        // Simulate based on file size or page count
        return 89;
    }

    selectedVoiceIsPremium(): boolean {
        const voice = this.standardVoices.find(v => v.id === this.bookConfig.voiceId);
        return voice?.isPremium || false;
    }

    calculateTotalPrice(): number {
        if (this.referralValid) return 0;
        
        let total = this.calculateBasePrice();
        
        if (this.bookConfig.useExpression) {
            total += 15;
        }
        
        if (this.selectedVoiceIsPremium()) {
            total += 20;
        }
        
        if (this.bookConfig.targetLanguage && 
            this.bookConfig.targetLanguage !== this.bookConfig.sourceLanguage) {
            total += 50; // Estimated translation cost
        }
        
        return total;
    }

    canProceedFromStep3(): boolean {
        return this.bookConfig.sourceLanguage !== '' &&
               this.bookConfig.voiceId !== '' &&
               this.bookConfig.title !== '' &&
               this.bookConfig.authorName !== '' &&
               this.bookConfig.categories.length > 0;
    }

    // Step 4: Review
    getLanguageName(code: string): string {
        const lang = this.availableLanguages.find(l => l.code === code);
        return lang ? lang.name : code;
    }

    getVoiceName(voiceId: string): string {
        const voice = this.standardVoices.find(v => v.id === voiceId);
        return voice ? voice.name : voiceId;
    }

    showTerms(event: Event) {
        event.preventDefault();
        this.showTermsModal = true;
    }

    closeTerms() {
        this.showTermsModal = false;
    }

    acceptTermsFromModal() {
        this.acceptedTerms = true;
        this.closeTerms();
    }

    submitUpload() {
        if (!this.acceptedTerms) return;
        
        console.log('Submitting upload:', {
            uploadMethod: this.uploadMethod,
            file: this.uploadedFile,
            config: this.bookConfig,
            referral: this.referralCode
        });

        // Simulate API call
        setTimeout(() => {
            this.currentStep = 5; // Success step
        }, 1000);
    }

    // Success actions
    goToMyBooks() {
        console.log('Navigate to my books');
    }

    uploadAnother() {
        // Reset form
        this.currentStep = 1;
        this.referralCode = '';
        this.referralValid = null;
        this.uploadMethod = null;
        this.uploadedFile = null;
        this.bookConfig = {
            sourceLanguage: '',
            targetLanguage: '',
            voiceId: '',
            useExpression: false,
            speechRate: '1.0',
            stability: 50,
            clarity: 75,
            title: '',
            authorName: '',
            description: '',
            categories: []
        };
        this.acceptedTerms = false;
    }

    goBack() {
        console.log('Navigate back');
    }

}

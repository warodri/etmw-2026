import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { UserModel } from '../../../models/user';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { InternetService } from '../../../SERVICES/internet.service';
import { ToastService } from '../../../SERVICES/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { PromoCodeModel } from '../../../models/promo-codes';
import { UtilClass } from '../../../utils/utils';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { Language, ProcessedVoice } from '../../../models/voices';
import { Config } from '../../../utils/config';

@Component({
    selector: 'app-screen-upload-audiobook',
    standalone: false,
    templateUrl: './screen-upload-audiobook.html',
    styleUrl: './screen-upload-audiobook.css',
})
export class ScreenUploadAudiobook implements OnInit, OnDestroy {
    
    //  My logged user (mandatory)
    myUser = signal<UserModel | null>(null);

    //  Promo codes providers arriving from server
    promoCodes = signal<PromoCodeModel[]>([]);

    //  Steps of the process
    currentStep = signal<number>(1);
    steps = [
        { number: 1, label: 'Pricing' },
        { number: 2, label: 'Upload' },
        { number: 3, label: 'Configure' },
        { number: 4, label: 'Review' }
    ];

    // Step 1: Referral & Pricing
    referralCode = signal<string | null>(null);
    referralValid = signal<boolean>(false);
    referralChecked = signal<boolean>(false);
    showPricingOptions = signal<boolean>(false);
    selectedPricing = signal<number | null>(null);

    //  This is the list of partners to show in the popup
    partners = signal<Array<{
        name: string,
        description: string,
        website: string
    }>>([]);

    // Step 2: Upload Method
    uploadMethod: 'digital' | 'mail' | null = null;
    uploadedFile: File | null = null;
    estimatedWordCount = signal<number>(0);
    translation: {
        useFixedPrice: boolean,
        PER_WORD: {
            latam: number,
            us: number,
            uk: number,
            global: number,
        }, 
        FIXED_PRICE: {
            latam: number,
            us: number,
            uk: number,
            global: number,
        }
    } = {
        useFixedPrice: true,
        PER_WORD: {
            latam: 0.002,
            us: 0.002,
            uk: 0.002,
            global: 0.002,
        }, 
        FIXED_PRICE: {
            latam: 5,
            us: 50,
            uk: 50,
            global: 50,
        }
    }
    TRANSLATION_PRICE_PER_WORD = 0;
    totalTranslation = signal<number>(0);
    isVoiceProfessional = signal<boolean>(false);

    // Step 3: Configuration
    showAdvanced = false;
    bookConfig = {
        sourceLanguage: '',
        targetLanguage: '',
        voiceId: '',
        voiceName: '',
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

    availableVoiceLanguages: Array<Language> = [];

    //  Region detected depends the pricing
    regionDetected = signal<string>('global');
    selectedCurrency = signal<string>('$');
    standardPricing: Array<{
        label: string,
        latam: number,
        us: number,
        uk: number,
        global: number,
    }> = []

    standardVoices = signal<Array<ProcessedVoice>>([]);
    premiumVoices = signal<Array<ProcessedVoice>>([]);
    premiumVoiceCost: {
        latam: number,
        us: number,
        uk: number,
        global: number,
    } = {
        latam: 3,
        us: 9,
        uk: 9,
        global: 9,
    }
    SELECTED_PREMIUM_VOICE_COST = signal<number>(0);
    
    voiceExpression: {
        latam: number,
        us: number,
        uk: number,
        global: number,
    } = {
        latam: 3,
        us: 9,
        uk: 9,
        global: 9,
    }
    SELECTED_VOICE_EXPRESSION_COST = signal<number>(0);

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
    showPartnersModal = signal<boolean>(false);
    
    // Payment & Polling
    audiobookId = signal<string | null>(null);
    paymentPollingInterval: any = null;
    showPaymentWaiting = signal<boolean>(false);
    includedVoicesShowMore = signal<boolean>(false);
    showPremiumVoices = signal<boolean>(false);
    premiumVoicesShowMore = signal<boolean>(false);

    sendBookAddress: {
        UK: {
            name: string,
            address: string,
            postcode: string,
            country: string
        }, 
        ARGENTINA: {
            name: string,
            address: string,
            postcode: string,
            country: string
        }
    } = {
        UK: {
            name: 'ETMW Publishing',
            address: '55 Kings Wood Park',
            postcode: 'CM16 6FA Epping, Essex',
            country: 'United Kingdom'
        }, 
        ARGENTINA: {
            name: 'ETMW Publishing',
            address: 'Colon 210',
            postcode: '3100 Paran, Entre Rios',
            country: 'Argentina'
        }
    }

    // Flags
    working = signal<boolean>(true);
    showInstructionsStep1 = signal<boolean>(true);
    private audio?: HTMLAudioElement;
    sendingBook = signal<boolean>(false);

    constructor(
        private iUser: InternetUserService,
        private iAudiobook: InternetAudiobookService,
        private internet: InternetService,
        private toast: ToastService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.getAppConfig(() => {
            this.calculatePremiumVoiceCost();
            this.calculateVoiceExpressionCost();
            this.loadMyUser(() => {
                this.getPromoCodes(() => {
                    this.populatePartnersArray();
                    this.detectRegion();
                    this.checkShowInstructionsStep1();
                    this.getAllCategories(() => {
                        this.working.set(false);
                    })
                });
            })
        })
    }

    ngOnDestroy(): void {
        this.stopPaymentPolling();
    }

    getAppConfig(callback: any) {
        this.internet.getAppConfig((response: any) => {
            console.log('getAppConfig', response);
            if (response && response.success) {
                this.standardPricing = response.standardPricing
                this.translation = response.translation;
                this.premiumVoiceCost = response.premiumVoiceCost;
                this.sendBookAddress = response.sendBookAddress;
                callback();
            }
        })
    }
    
    getAllCategories(callback: any) {
        this.iAudiobook.getAllCategories((response: any) => {
            console.log('getAllCategories', response);
            if (response && response.success) {
                const a = [];
                for (let item of response.categories) {
                    a.push(item.name)
                }
                this.availableCategories = a;
            }
            callback();
        })
    }

    calculatePremiumVoiceCost() {
        const regionDetected = this.regionDetected();
        if (regionDetected && this.premiumVoiceCost) {
            if (regionDetected == 'latam') {
                this.SELECTED_PREMIUM_VOICE_COST.set(this.premiumVoiceCost.latam)
            }
            else if (regionDetected == 'us') {
                this.SELECTED_PREMIUM_VOICE_COST.set(this.premiumVoiceCost.us);
            }
            else if (regionDetected == 'uk') {
                this.SELECTED_PREMIUM_VOICE_COST.set(this.premiumVoiceCost.uk);
            } else {
                this.SELECTED_PREMIUM_VOICE_COST.set(this.premiumVoiceCost.global);
            }            
        }
    }

    calculateVoiceExpressionCost() {
        const regionDetected = this.regionDetected();
        if (regionDetected && this.voiceExpression) {
            if (regionDetected == 'latam') {
                this.SELECTED_VOICE_EXPRESSION_COST.set(this.voiceExpression.latam)
            }
            else if (regionDetected == 'us') {
                this.SELECTED_VOICE_EXPRESSION_COST.set(this.voiceExpression.us);
            }
            else if (regionDetected == 'uk') {
                this.SELECTED_VOICE_EXPRESSION_COST.set(this.voiceExpression.uk);
            } else {
                this.SELECTED_VOICE_EXPRESSION_COST.set(this.voiceExpression.global);
            }            
        }
    }

    checkShowInstructionsStep1() {
        const showInstructions = localStorage.getItem('etmw-na-step-1');
        if (showInstructions && showInstructions == '1') {
            this.showInstructionsStep1.set(false);
        }
    }

    closeInstructionsStep1() {
        localStorage.setItem('etmw-na-step-1', '1');
        this.showInstructionsStep1.set(false);
    }

    loadMyUser(callback: any) {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response)
            if (response && response.success) {
                this.myUser.set(response.user);
                callback();
            }
        })
    }

    getPromoCodes(callback: any) {
        this.internet.getPromoCodes((response: any) => {
            console.log('getPromoCodes', response)
            if (response && response.success) {
                this.promoCodes.set( response.data );
            }
            callback();
        })
    }

    populatePartnersArray() {
        const a: Array<{
            name: string,
            description: string,
            website: string
        }> = [];
        for (let item of this.promoCodes()) {
            a.push({
                name: item.partnerName,
                description: item.partnerDescription,
                website: item.linkToCode
            })
        }
        this.partners.set(a);
    }

    detectRegion() {
        const regionInfo = UtilClass.detectRegion();        
        this.regionDetected.set(regionInfo.region);
        this.selectedCurrency.set(regionInfo.currency);
    }

    selectUploadBasePrice(item: {
        label: string,
        latam: number,
        us: number,
        uk: number,
        global: number,
    }) {
        let price = 0;
        if (this.regionDetected() == 'latam') {
            price = item.latam;
        } else if (this.regionDetected() == 'us') {
            price = item.us;
        } else if (this.regionDetected() == 'uk') {
            price = item.us;
        } else {
            price = item.global;
        }
        this.selectedPricing.set(price);
        this.nextStep();
    }

    // Progress calculation
    getProgressPercent(): number {
        return ((this.currentStep() - 1) / (this.steps.length - 1)) * 100;
    }

    // Step navigation
    nextStep() {
        if (this.currentStep() == 1) {
            //  Validate a PROMO CODE or pricing
            const referralCode = this.referralCode();
            const referralValid = this.referralValid();
            const selectedPricing = this.selectedPricing();
            if ((!referralCode || !referralValid) && !selectedPricing) {
                this.toast.show('Please enter a promo code or pick a pricing');
                return;
            }
            //  Donwlod voices for next step
            this.iAudiobook.getVoicesByTier((response: any) => {
                console.log('getVoicesByTier', response)
                if (response && response.success) {
                    this.standardVoices.set(response.voices.standard)
                    this.premiumVoices.set(response.voices.premium)
                }
            })
        }
        if (this.currentStep() < 5) {
            this.currentStep.set(this.currentStep() + 1);
        }
    }

    prevStep() {
        if (this.currentStep() > 1) {
            this.currentStep.set(this.currentStep() -1);
        }
    }

    // Step 1: Referral
    applyReferralCode() {
        const promoCode = this.referralCode();
        if (this.working() || !promoCode) return;
        this.working.set(true);
        this.internet.validatePromoCode(promoCode, (response: any) => {
            this.working.set(false);
            console.log('validatePromoCode', response);
            this.referralChecked.set(true);
            if (response && response.success) {
                this.referralValid.set(true);
                this.nextStep();
            } else {
                this.toast.show('This code seems to be incorrect.')
            }
        })
    }

    showPartners() {
        this.showPartnersModal.set(true);
    }

    closePartners() {
        this.showPartnersModal.set(false);
    }

    // Step 2: Upload
    selectUploadMethod(method: 'digital' | 'mail') {
        this.uploadMethod = method;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.uploadedFile = file;
            this.countWordsInFile(file);
        }
    }

    async countWordsInFile(file: File) {
        try {
            const text = await file.text();
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            this.estimatedWordCount.set(words.length);
        } catch (error) {
            console.error('Error counting words:', error);
            this.estimatedWordCount.set(0);
        }
    }

    removeFile() {
        this.uploadedFile = null;
        this.estimatedWordCount.set(0);
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
    selectVoice(voiceId: string, voiceName: string, isPro: boolean) {
        this.bookConfig.voiceId = voiceId;
        this.bookConfig.voiceName = voiceName;
        this.isVoiceProfessional.set(isPro);
    }

    playVoiceSample(event: Event, sampleUrl: string) {
        event.stopPropagation();
        if (!sampleUrl) return;
        // Stop previous audio if playing
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        this.audio = new Audio(sampleUrl);
        this.audio.play().catch(err => {
            console.error('Audio play failed:', err);
        });
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

    calculateBasePrice() {
        const price = this.selectedPricing();
        if (!price) {
            return 0;
        } else {
            return price;
        }
    }

    calculateTotalPrice(): number {        
        let total = 0;
        
        // Only add base price if no valid referral code
        if (!this.referralValid()) {
            total += this.calculateBasePrice();
        }
        
        // Always add premium features cost, even with referral
        if (this.bookConfig.useExpression) {
            total += 15;
        }
        
        if (this.isVoiceProfessional()) {
            total += 20;
        }
        
        if (this.bookConfig.targetLanguage && 
            this.bookConfig.targetLanguage !== this.bookConfig.sourceLanguage) {
            total += this.getTranslationCost();
        }
        
        return total;
    }

    getTranslationCost(): number {
        return this.totalTranslation();
    }

    calculateTranslationCost() {
        const regionDetected = this.regionDetected() || 'global';
        let total = 0;
        if (this.translation.useFixedPrice) {
            //  USING FIXED PRICE FOR TRANSLATION
            if (regionDetected == 'latam') total = this.translation.FIXED_PRICE.latam;
            else if (regionDetected == 'us') total = this.translation.FIXED_PRICE.us;
            else if (regionDetected == 'uk') total = this.translation.FIXED_PRICE.uk;
            else total = this.translation.FIXED_PRICE.global;
            this.totalTranslation.set(total);
        } else {
            //  USING PRICE PER WORD FOR TRANSLATION
            const wordCount = this.estimatedWordCount();
            if (wordCount !== 0) {
                let pricePerWord = 0;
                if (regionDetected == 'latam') pricePerWord = this.translation.PER_WORD.latam;
                else if (regionDetected == 'us') pricePerWord = this.translation.PER_WORD.us;
                else if (regionDetected == 'uk') pricePerWord = this.translation.PER_WORD.uk;
                else pricePerWord = this.translation.PER_WORD.global;    
                total = Math.round(wordCount * pricePerWord);
                this.totalTranslation.set(total);
                this.TRANSLATION_PRICE_PER_WORD = pricePerWord;
            }
        }
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
        const voice = this.standardVoices().find(v => v.id === voiceId);
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
        //  Validate
        if (!this.acceptedTerms) return;
        if (this.working()) return;

        //  Working
        this.working.set(true);

        //  Send data
        const formData = new FormData();
        if (this.uploadedFile) {
            formData.append('file', this.uploadedFile);
        }
        formData.append('uploadMethod', this.uploadMethod || '');
        formData.append('config', JSON.stringify(this.bookConfig));
        formData.append('referralCode', this.referralCode() || '');
        formData.append('totalPrice', this.calculateTotalPrice().toString());
        formData.append('basePrice', this.calculateBasePrice().toString());
        formData.append('hasReferral', this.referralValid().toString());
        
        // Create audiobook record
        this.iAudiobook.createAudiobookUpload(formData, (response: any) => {
            this.working.set(false);
            console.log('createAudiobookUpload', response);
            
            if (response && response.success) {
                const audiobookId = response.audiobook._id;
                this.audiobookId.set(audiobookId);
                
                //  Price to pay                
                const totalPrice = this.calculateTotalPrice();                
                if (totalPrice > 0) {
                    // Need payment - open Stripe and start polling
                    this.openStripePayment(audiobookId, totalPrice);
                } else {
                    // Free - go directly to success
                    this.currentStep.set(5);
                }
            } else {
                this.toast.show('Error creating audiobook upload');
            }
        });
    }
    
    openStripePayment(audiobookId: string, amount: number) {
        //  Get currency
        const currency = this.selectedCurrency();
        // Get Stripe checkout URL from server
        this.working.set(true);
        this.iAudiobook.createStripeCheckout(audiobookId, currency, amount, (response: any) => {
            this.working.set(false);
            console.log('createStripeCheckout', response);
            
            if (response && response.success && response.checkoutUrl) {
                // Show waiting message
                this.showPaymentWaiting.set(true);
                
                // Open Stripe in new window
                window.open(response.checkoutUrl, '_blank');
                
                // Start polling for payment confirmation
                this.startPaymentPolling(audiobookId);
            } else {
                this.toast.show('Error creating payment session');
            }
        });
    }
    
    startPaymentPolling(audiobookId: string) {
        // Poll every 3 seconds
        this.paymentPollingInterval = setInterval(() => {
            this.checkPaymentStatus(audiobookId);
        }, 3000);
    }
    
    checkPaymentStatus(audiobookId: string) {
        this.iAudiobook.checkAudiobookPaymentStatus(audiobookId, (response: any) => {
            console.log('checkPaymentStatus', response);
            
            if (response && response.success && response.paymentCompleted) {
                // Payment confirmed!
                this.stopPaymentPolling();
                this.showPaymentWaiting.set(false);
                this.currentStep.set(5);
            }
        });
    }
    
    stopPaymentPolling() {
        if (this.paymentPollingInterval) {
            clearInterval(this.paymentPollingInterval);
            this.paymentPollingInterval = null;
        }
    }
    
    cancelPaymentWaiting() {
        this.stopPaymentPolling();
        this.showPaymentWaiting.set(false);
        this.toast.show('Payment cancelled. You can try again.');
    }

    // Success actions
    goToMyBooks() {
        const myUser = this.myUser();
        if (myUser) {
            this.router.navigate(['app/user-profile', myUser._id])
        }
    }

    uploadAnother() {
        // Reset form
        this.currentStep.set(1);
        this.referralCode.set(null);
        this.referralValid.set(false);
        this.uploadMethod = null;
        this.uploadedFile = null;
        this.bookConfig = {
            sourceLanguage: '',
            targetLanguage: '',
            voiceId: '',
            voiceName: '',
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

    dontHaveReferralCodeSelected() {
        this.showPricingOptions.set(true);
    }

    toggleShowMoreIncludedVouces() {
        this.includedVoicesShowMore.set(!this.includedVoicesShowMore())
    }

    toggleShowPremiumVoices() {
        this.showPremiumVoices.set(!this.showPremiumVoices())
    }
 
    toggleShowMorePremiumVouces() {
        this.premiumVoicesShowMore.set(!this.premiumVoicesShowMore())
    }

    showAllCategories = signal<boolean>(false);

    toggleShowAllCategories() {
        this.showAllCategories.set(!this.showAllCategories())
    }

}
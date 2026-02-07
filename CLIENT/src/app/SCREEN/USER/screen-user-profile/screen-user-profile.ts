import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from '../../../models/user';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { ToastService } from '../../../SERVICES/toast';
import { InternetService } from '../../../SERVICES/internet.service';
import { UtilsService } from '../../../utils/utils-service';

@Component({
    selector: 'app-screen-user-profile',
    standalone: false,
    templateUrl: './screen-user-profile.html',
    styleUrl: './screen-user-profile.css',
})
export class ScreenUserProfile implements OnInit {

    userId = signal<string | null>(null);
    user = signal<UserModel | null>(null);
    
    myUser = signal<UserModel | null>(null);

    profilePhoto = signal<File | null>(null);
    coverPhoto = signal<File | null>(null);

    selectedLanguageToAdd = '';
    availableLanguages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' },
        { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
        { code: 'pl', name: 'Polish', flag: '🇵🇱' },
        { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
        { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
        { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
        { code: 'da', name: 'Danish', flag: '🇩🇰' },
        { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
        { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
        { code: 'cs', name: 'Czech', flag: '🇨🇿' }
    ];

    //  Flags
    working = signal<boolean>(false);
    isMine = signal<boolean>(false);

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private iUser: InternetUserService,
        private toast: ToastService,
        private internet: InternetService,
        private utilService: UtilsService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.userId.set(params.get('id'));
            this.loadUser(() => {
                this.loadMyUser(() => {
                    this.checkIfMyUser();
                    this.checkForcedStatus();
                });
            })
        })
    }

    loadUser(callback: any) {
        const userId = this.userId();
        if (userId) {
            this.iUser.getUserById(userId, (response: any) => {
                console.log('getUserById', response)
                if (response && response.success) {
                    this.user.set(response.user);
                    callback();
                } else {
                    this.toast.show(this.toast.getMessageErrorUnexpected())
                }
            })
        }
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

    checkIfMyUser() {
        const user = this.user();
        const myUser = this.myUser();
        if (user && myUser && user._id == myUser._id) {
            this.isMine.set(true);
        }
    }

    goHome() {
        this.router.navigate(['app'])
    }

    onFileSelected(event: Event, what: 'profile' | 'banner'): void {
        const user = this.user();
        if (!user) {
            return;
        }
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            //  Upload file and return URL
            this.internet.uploadFileAndReturn(file, (response: any) => {
                console.log('onFileSelected', response)
                if (response && response.success) {
                    const item: any = response.file;
                    const filename = item.filename;
                    const mimetype = item.mimetype;
                    const url = this.utilService.getClientUrlForFiles(filename, mimetype);
                    console.log('url', url)
                    if (what == 'profile') {
                        this.profilePhoto.set(file);
                        user.profilePicture = url;
                    } else {
                        this.coverPhoto.set(file);
                        user.coverPicture = url;
                    }
                } else {
                    this.toast.show(this.toast.getMessageErrorUnexpected())
                }
            })
        }
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    addLanguage() {
        const user = this.user();
        if (user) {
            if (this.selectedLanguageToAdd && !user.languages.includes(this.selectedLanguageToAdd)) {
                user.languages.push(this.selectedLanguageToAdd);
                this.selectedLanguageToAdd = ''; // Reset selector
            }
        }
    }
    
    removeLanguage(langCode: string) {
        const user = this.user();
        if (user) {
            user.languages = user.languages.filter(code => code !== langCode);
        }
    }
    
    getLanguageDisplay(langCode: string): string {
        const lang = this.availableLanguages.find(l => l.code === langCode);
        return lang ? `${lang.flag} ${lang.name}` : langCode;
    }

    checkForcedStatus() {
        const user = this.user();
        if (user && user.forceStatus) {
            if (user.forceStatus == 'connected') {
                user.connected = true;
            } else if (user.forceStatus == 'disconnected') {
                user.connected = false;
            }
        }
    }

    toggleForcedStatus(connected: boolean) {
        const user = this.user();
        if (user) {
            user.forceStatus = connected ? 'connected' : 'disconnected'
            this.checkForcedStatus();
        }
    }

    saveChanges() {
        const user = this.user();
        if (this.working() || !user) return;
        this.working.set(true);
        this.iUser.updateMyProfile(user, (response: any) => {
            this.working.set(false);
            console.log('updateMyProfile', response)
            this.toast.show('User updated!')
        })
    }

}

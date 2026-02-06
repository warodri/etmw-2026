import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    constructor() { }

    //  ANY VALUE
    storeTag(key: string, value: string) {
        localStorage.setItem(key, value);
    }
    getTag(key: string) {
        return localStorage.getItem(key);
    }

    //  CITY
    storeSelectedCity(_id: string) {
        localStorage.setItem('ht-city', _id)
    }
    getSelectedCity() {
        return localStorage.getItem('ht-city')
    }
    storeSelectedCityName(name: string) {
        localStorage.setItem('ht-city-name', name)
    }
    getSelectedCityName() {
        return localStorage.getItem('ht-city-name')
    }

    //  ARE YOU A WRITER?
    hideWriterWindow() {
        localStorage.setItem('ht-writer-window', 'off')
    }
    isWriterWindowHidden() {
        const value = localStorage.getItem('ht-writer-window')
        return value && value == 'off' ? false : true
    }


}

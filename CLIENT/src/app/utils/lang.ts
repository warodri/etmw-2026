import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LangUtils {

    public ENGLISH = 'en';
    public SPANISH = 'es';

    public static detectLanguage(): 'en' | 'es' {
        
        // Get the browser's preferred languages
        const languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];

        // Check if any of the languages is a form of Spanish
        const spanishRegex = /^es(-|$)/;

        for (const language of languages) {
            if (spanishRegex.test(language)) {
                return 'es'; // Return 'es' if any of the languages is Spanish
            }
        }
        return 'en'; // Default to 'en' if no Spanish language is found
    }

}
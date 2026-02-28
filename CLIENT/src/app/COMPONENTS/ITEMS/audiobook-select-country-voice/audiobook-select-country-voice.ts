import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LANGUAGE_MAP, REGION_MAP } from '../../../DATA/country-list';

export const availableLocales = [
    { code: 'ar-EG', name: 'ar-EG' },
    { code: 'ar-KW', name: 'ar-KW' },
    { code: 'ar-LB', name: 'ar-LB' },
    { code: 'ar-MA', name: 'ar-MA' },
    { code: 'ar-SA', name: 'ar-SA' },
    { code: 'bg-BG', name: 'bg-BG' },
    { code: 'ceb-PH', name: 'ceb-PH' },
    { code: 'cmn-CN', name: 'cmn-CN' },
    { code: 'cmn-TW', name: 'cmn-TW' },
    { code: 'cs-CZ', name: 'cs-CZ' },
    { code: 'da-DK', name: 'da-DK' },
    { code: 'de-AT', name: 'de-AT' },
    { code: 'de-DE', name: 'de-DE' },
    { code: 'el-GR', name: 'el-GR' },
    { code: 'en-AU', name: 'en-AU' },
    { code: 'en-CA', name: 'en-CA' },
    { code: 'en-FI', name: 'en-FI' },
    { code: 'en-GB', name: 'en-GB' },
    { code: 'en-IE', name: 'en-IE' },
    { code: 'en-IN', name: 'en-IN' },
    { code: 'en-JM', name: 'en-JM' },
    { code: 'en-KR', name: 'en-KR' },
    { code: 'en-MY', name: 'en-MY' },
    { code: 'en-NG', name: 'en-NG' },
    { code: 'en-NZ', name: 'en-NZ' },
    { code: 'en-PH', name: 'en-PH' },
    { code: 'en-RU', name: 'en-RU' },
    { code: 'en-SG', name: 'en-SG' },
    { code: 'en-US', name: 'en-US' },
    { code: 'en-ZA', name: 'en-ZA' },
    { code: 'es-AR', name: 'es-AR' },
    { code: 'es-CL', name: 'es-CL' },
    { code: 'es-CO', name: 'es-CO' },
    { code: 'es-ES', name: 'es-ES' },
    { code: 'es-MX', name: 'es-MX' },
    { code: 'es-PE', name: 'es-PE' },
    { code: 'es-US', name: 'es-US' },
    { code: 'es-VE', name: 'es-VE' },
    { code: 'fi-FI', name: 'fi-FI' },
    { code: 'fil-PH', name: 'fil-PH' },
    { code: 'fr-BE', name: 'fr-BE' },
    { code: 'fr-CA', name: 'fr-CA' },
    { code: 'fr-CH', name: 'fr-CH' },
    { code: 'fr-FR', name: 'fr-FR' },
    { code: 'fr-TN', name: 'fr-TN' },
    { code: 'fr-US', name: 'fr-US' },
    { code: 'hi-IN', name: 'hi-IN' },
    { code: 'hr-HR', name: 'hr-HR' },
    { code: 'hu-HU', name: 'hu-HU' },
    { code: 'id-ID', name: 'id-ID' },
    { code: 'ilo-PH', name: 'ilo-PH' },
    { code: 'it-IT', name: 'it-IT' },
    { code: 'ja-JP', name: 'ja-JP' },
    { code: 'jv-ID', name: 'jv-ID' },
    { code: 'ko-KR', name: 'ko-KR' },
    { code: 'li-NL', name: 'li-NL' },
    { code: 'ms-MY', name: 'ms-MY' },
    { code: 'nl-BE', name: 'nl-BE' },
    { code: 'nl-NL', name: 'nl-NL' },
    { code: 'no-NO', name: 'no-NO' },
    { code: 'pl-PL', name: 'pl-PL' },
    { code: 'pt-BR', name: 'pt-BR' },
    { code: 'pt-PT', name: 'pt-PT' },
    { code: 'ro-RO', name: 'ro-RO' },
    { code: 'ru-RU', name: 'ru-RU' },
    { code: 'sk-SK', name: 'sk-SK' },
    { code: 'sv-SE', name: 'sv-SE' },
    { code: 'ta-IN', name: 'ta-IN' },
    { code: 'tr-TR', name: 'tr-TR' },
    { code: 'uk-UA', name: 'uk-UA' },
    { code: 'vi-VN', name: 'vi-VN' }
];

export function getLocaleLabel(code: string): string {
    if (!code) return '';
    const [lang, region] = code.split('-');
    const languageMap: Record<string, string> = LANGUAGE_MAP;
    const regionMap: Record<string, string> = REGION_MAP;

    const languageName = languageMap[lang] || lang;
    const regionName = regionMap[region] || region;
    return region ? `${languageName} (${regionName})` : languageName;
}


@Component({
  selector: 'app-audiobook-select-country-voice',
  standalone: false,
  templateUrl: './audiobook-select-country-voice.html',
  styleUrl: './audiobook-select-country-voice.css',
})
export class AudiobookSelectCountryVoice {

    @Input() labelEn = 'Same as source';
    @Input() labelEs = 'Igual que origen';
    @Output() onValueChanged = new EventEmitter<string>();

    targetLanguage = '';

    AVAILABLE_LOCALES = availableLocales;
    GET_LOCALE_LABELS = getLocaleLabel

    language: 'en' | 'es' = 'en';
    
    informChange() {
        this.onValueChanged.emit(this.targetLanguage);
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }


}

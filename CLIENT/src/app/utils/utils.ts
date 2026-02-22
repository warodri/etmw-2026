declare var window: any;
// import * as CryptoJS from 'crypto-js';
import { Config } from './config';

export class UtilClass {

    public static detectRegion() {
        const browserLanguage = navigator.language || (navigator as any).userLanguage;
        
        const latamCountries = [
            'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR', 'es-CU', 'es-DO', 
            'es-EC', 'es-SV', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA', 
            'es-PY', 'es-PE', 'es-PR', 'es-UY', 'es-VE'
        ];
        
        if (latamCountries.includes(browserLanguage)) {
            return {
                region: 'latam',
                currency: '$'    
            }
        } else if (browserLanguage.startsWith('es-') && browserLanguage !== 'es-US' && browserLanguage !== 'es-ES') {
            return {
                region: 'latam',
                currency: '$'    
            }
        } else if (browserLanguage === 'en-US') {
            return {
                region: 'us',
                currency: '$'
            }
        } else if (browserLanguage.startsWith('en-GB')) {
            return {
                region: 'uk',
                currency: '£'
            }
        } else {
            return {
                region: 'global',
                currency: '€'
            }
        }
    }

    public static getPolygonCentroid(polygon: { lat: number; lng: number }[]): { lat: number; lng: number } {
        let lat = 0, lng = 0;
        for (const p of polygon) {
          lat += p.lat;
          lng += p.lng;
        }
        return { lat: lat / polygon.length, lng: lng / polygon.length };
    }

    public static isPointInPolygon(lat: number, lng: number, polygon: { lat: number; lng: number }[]): boolean {
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lng, yi = polygon[i].lat;  // note: swap lng=x, lat=y
            const xj = polygon[j].lng, yj = polygon[j].lat;

            const intersect =
                ((yi > lat) !== (yj > lat)) &&
                (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    }
      

    public static getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371000; // Earth radius in meters
        const toRad = (x: number) => x * Math.PI / 180;

        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public static playNotificationSound() {
        const audio = new Audio();
        audio.src = Config.ASSETS_BASE_URL + 'nee-chat.mp3';  // path to your sound file
        audio.load();
        audio.play().catch(err => {
            console.warn('Audio playback failed:', err);
        });
    }

    // public static encrypt(text: string, password: string): string {
    //     return CryptoJS.AES.encrypt(text, password).toString();
    // }

    public static capitalizeFirstLetter(value: string): string {
        if (!value) return value;
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    /**
     * Send 24 hours date and convert to milliseconds 
     * using the current date.
     */
    public static convertTimeToMilliseconds(time: string): number {
        // Get the current date
        const currentDate = new Date();
        // Split the time string into hours and minutes
        const [hours, minutes] = time.split(':').map(Number);
        // Set the hours and minutes on the current date
        currentDate.setHours(hours, minutes, 0, 0); // Set seconds and milliseconds to 0
        // Get the time in milliseconds
        return currentDate.getTime();
    }

    public static timeAgo(date: Date): string {
        const now = new Date().getTime();
        const targetTime = date.getTime();
        const differenceInSeconds = Math.floor((targetTime - now) / 1000);
        const isFuture = differenceInSeconds > 0;
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 },
        ];
        const absSeconds = Math.abs(differenceInSeconds);
        for (const interval of intervals) {
            const count = Math.floor(absSeconds / interval.seconds);
            if (count > 0) {
                const label = `${count} ${interval.label}${count !== 1 ? 's' : ''}`;
                return isFuture ? `in ${label}` : `${label} ago`;
            }
        }
        return isFuture ? 'just now' : 'just now';
    }

    public static formatDate(milliseconds: number): string {
        const date = new Date(milliseconds);
        // Extract parts of the date
        const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
        const month = date.toLocaleDateString('en-GB', { month: 'long' });
        const day = date.getDate();
        return `${weekday}, ${month} ${day}`;
    }

    public static convertTimestampToTime(timestamp: number): string {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    public static sValidEmail(email: string | undefined): boolean {
        if (!email) {
            return false;
        }
        const emailPattern = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$/i;
        return emailPattern.test(email);
    }

    public static isMobileApp(): 'android' | 'ios' | 'web' {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(userAgent)) {
            return 'android';
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            return 'ios';
        } else {
            return 'web';
        }
    }

}
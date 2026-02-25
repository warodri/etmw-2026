import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-screen-partners',
    standalone: false,
    templateUrl: './screen-partners.html',
    styleUrl: './screen-partners.css',
})
export class ScreenPartners implements OnInit, OnDestroy {

    SELECTED_PARTNER = signal<string | null>(null);
    IFRAME_LOADING = signal<boolean>(false);
    language: 'en' | 'es' = 'en';
    private iframeLoadingFallbackTimer: ReturnType<typeof setTimeout> | null = null;
    private iframeRevealDelayTimer: ReturnType<typeof setTimeout> | null = null;
    private enforceInitialDelay = false;
    private iframeLoadingStartedAtMs = 0;
    private readonly firstVisitDelayMs = 40000;
    private readonly repeatVisitFallbackMs = 20000;
    private readonly firstVisitFallbackExtraMs = 10000;
    private readonly firstVisitTimestampKey = 'partners_mariano_iframe_first_visit_ts';
    private readonly firstVisitWindowMs = 90 * 24 * 60 * 60 * 1000; // ~3 months

    constructor(
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.language = LangUtils.detectLanguage();

        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.SELECTED_PARTNER.set(id);

                if (id === 'mariano') {
                    this.enforceInitialDelay = this.shouldApplyFirstVisitDelay();
                    this.iframeLoadingStartedAtMs = Date.now();
                    this.IFRAME_LOADING.set(true);
                    this.startIframeFallbackTimer();
                }
            }
        });
    }

    onIframeLoad(): void {
        if (this.iframeLoadingFallbackTimer) {
            clearTimeout(this.iframeLoadingFallbackTimer);
            this.iframeLoadingFallbackTimer = null;
        }

        if (!this.enforceInitialDelay) {
            this.IFRAME_LOADING.set(false);
            return;
        }

        if (this.iframeRevealDelayTimer) {
            clearTimeout(this.iframeRevealDelayTimer);
        }

        const elapsedMs = Date.now() - this.iframeLoadingStartedAtMs;
        const remainingMs = Math.max(0, this.firstVisitDelayMs - elapsedMs);

        this.iframeRevealDelayTimer = setTimeout(() => {
            this.IFRAME_LOADING.set(false);
            this.iframeRevealDelayTimer = null;
        }, remainingMs);
    }

    ngOnDestroy(): void {
        if (this.iframeLoadingFallbackTimer) {
            clearTimeout(this.iframeLoadingFallbackTimer);
            this.iframeLoadingFallbackTimer = null;
        }

        if (this.iframeRevealDelayTimer) {
            clearTimeout(this.iframeRevealDelayTimer);
            this.iframeRevealDelayTimer = null;
        }
    }

    private startIframeFallbackTimer(): void {
        if (this.iframeLoadingFallbackTimer) {
            clearTimeout(this.iframeLoadingFallbackTimer);
        }

        const fallbackMs = this.enforceInitialDelay
            ? this.firstVisitDelayMs + this.firstVisitFallbackExtraMs
            : this.repeatVisitFallbackMs;

        this.iframeLoadingFallbackTimer = setTimeout(() => {
            this.IFRAME_LOADING.set(false);
            this.iframeLoadingFallbackTimer = null;
        }, fallbackMs);
    }

    private shouldApplyFirstVisitDelay(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }

        try {
            const rawTimestamp = window.localStorage.getItem(this.firstVisitTimestampKey);
            const timestampMs = rawTimestamp ? Number(rawTimestamp) : NaN;
            const nowMs = Date.now();
            const isValidTimestamp = Number.isFinite(timestampMs) && timestampMs > 0;

            if (!isValidTimestamp || nowMs - timestampMs > this.firstVisitWindowMs) {
                window.localStorage.setItem(this.firstVisitTimestampKey, String(nowMs));
                return true;
            }
        } catch {
            return false;
        }

        return false;
    }

    tr(enText: string, esText: string): string {
        return this.language === 'es' ? esText : enText;
    }

}

import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { InternetAdminService } from '../../../SERVICES/internet-admin.service';
import { Config } from '../../../utils/config';
import { AudiobookModel } from '../../../models/audiobook';
import { UtilClass } from '../../../utils/utils';
import { UtilsService } from '../../../utils/utils-service';

type PromoCode = {
    _id: string;
    code: string;
    partnerName: string;
    partnerDescription: string;
    website: string;
    linkToCode: string;
    enabled: boolean;
    createdAt: number;
};

type PromoForm = {
    code: string;
    partnerName: string;
    partnerDescription: string;
    website: string;
    linkToCode: string;
    enabled: boolean;
};

@Component({
    selector: 'app-screen-admin',
    standalone: false,
    templateUrl: './screen-admin.html',
    styleUrl: './screen-admin.css',
})
export class ScreenAdminComponent implements OnInit, OnDestroy {

    SERVER = Config.dev ? Config.SERVER.local : Config.SERVER.remote;
    
    activeSection = signal<'promo' | 'audiobooks'>('audiobooks');

    promoCodes = signal<PromoCode[]>([]);
    promoLoading = signal(false);
    promoFormOpen = signal(false);
    promoEditId = signal<string | null>(null);
    promoForm = signal<PromoForm>({
        code: '',
        partnerName: '',
        partnerDescription: '',
        website: '',
        linkToCode: '',
        enabled: true,
    });

    audiobooks = signal<any[]>([]);
    audiobooksLoading = signal(false);
    currentAudiobook = signal<AudiobookModel | null>(null);
    detailsOpen = signal(false);

    conversionStatusVisible = signal(false);
    conversionStatusText = signal('');
    conversionStatusType = signal<'info' | 'success' | 'danger'>('info');

    pdfStatus = signal('');
    pdfTextForConversion = signal('');
    pdfNameForConversion = signal('');
    selectedPdfFile = signal<File | null>(null);
    selectedSampleVoiceFile = signal<File | null>(null);

    audioUrls = signal<Record<number, string>>({});
    audioLoading = signal<Record<number, boolean>>({});

    totalChaptersInput = signal('');
    totalPagesInput = signal('');
    chapterNumberInput = signal('');
    popularLanguages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'pt', label: 'Português' },
        { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' },
        { code: 'it', label: 'Italiano' },
        { code: 'nl', label: 'Nederlands' },
        { code: 'pl', label: 'Polski' },
        { code: 'ru', label: 'Русский' },
        { code: 'ja', label: '日本語' },
        { code: 'ko', label: '한국어' },
        { code: 'zh', label: '中文' },
        { code: 'ar', label: 'العربية' },
        { code: 'hi', label: 'हिन्दी' }
    ];

    stories = signal<any[]>([]);
    storiesLoading = signal(false);
    storiesError = signal('');
    storyExpanded = signal<Record<string, boolean>>({});
    storyLanguageInput = signal('');
    storyEditId = signal<string | null>(null);
    storyEditSaving = signal(false);
    storyFileUploading = signal(false);
    storyEditError = signal('');
    storyEditForm = signal<any>({
        title: '',
        subtitle: '',
        quote: '',
        image: '',
        author: '',
        chapterNumber: '',
        totalChapters: '',
        language: '',
        slideIndex: '',
        chapterPieces: []
    });

    private pdfJsLoaded = false;
    private pdfJsLoading = false;

    constructor(
        private internetAdmin: InternetAdminService,
        private utils: UtilsService
    ) {}

    ngOnInit() {
        this.loadAudiobooks();
    }

    ngOnDestroy() {
        this.revokeAudioUrls();
    }

    setActiveSection(section: 'promo' | 'audiobooks') {
        this.activeSection.set(section);
        if (section === 'promo' && this.promoCodes().length === 0) {
            this.loadPromoCodes();
        }
    }

    // PROMO CODES
    loadPromoCodes() {
        this.promoLoading.set(true);
        this.internetAdmin.getAdminPromoCodes((result: any) => {
            this.promoLoading.set(false);
            if (result && result.success && Array.isArray(result.data)) {
                this.promoCodes.set(result.data);
            } else {
                this.promoCodes.set([]);
            }
        });
    }

    openAddPromoCode() {
        this.promoEditId.set(null);
        this.promoFormOpen.set(true);
        this.promoForm.set({
            code: '',
            partnerName: '',
            partnerDescription: '',
            website: '',
            linkToCode: '',
            enabled: true,
        });
    }

    editPromoCode(code: PromoCode) {
        this.promoEditId.set(code._id);
        this.promoFormOpen.set(true);
        this.promoForm.set({
            code: code.code || '',
            partnerName: code.partnerName || '',
            partnerDescription: code.partnerDescription || '',
            website: code.website || '',
            linkToCode: code.linkToCode || '',
            enabled: !!code.enabled,
        });
    }

    cancelPromoForm() {
        this.promoFormOpen.set(false);
        this.promoEditId.set(null);
    }

    setPromoFormField<K extends keyof PromoForm>(key: K, value: PromoForm[K]) {
        this.promoForm.update(form => ({
            ...form,
            [key]: value
        }));
    }

    savePromoCode() {
        const form = this.promoForm();
        if (!form.code || !form.partnerName || !form.partnerDescription || !form.website || !form.linkToCode) {
            alert('Completa todos los campos requeridos.');
            return;
        }

        const editId = this.promoEditId();
        if (editId) {
            this.internetAdmin.editPromoCode(
                editId,
                form.code,
                form.partnerName,
                form.partnerDescription,
                form.website,
                form.linkToCode,
                form.enabled,
                (result: any) => {
                    if (result && result.success) {
                        this.promoFormOpen.set(false);
                        this.loadPromoCodes();
                    } else {
                        alert(result?.message || 'Error al actualizar el promo code');
                    }
                }
            );
        } else {
            this.internetAdmin.addPromoCode(
                form.code,
                form.partnerName,
                form.partnerDescription,
                form.website,
                form.linkToCode,
                form.enabled,
                (result: any) => {
                    if (result && result.success) {
                        this.promoFormOpen.set(false);
                        this.loadPromoCodes();
                    } else {
                        alert(result?.message || 'Error al crear el promo code');
                    }
                }
            );
        }
    }

    deletePromoCode(code: PromoCode) {
        if (!confirm(`¿Eliminar promo code "${code.code}"?`)) return;
        this.internetAdmin.deletePromoCode(code._id, (result: any) => {
            if (result && result.success) {
                this.loadPromoCodes();
            } else {
                alert(result?.message || 'Error al eliminar el promo code');
            }
        });
    }

    // AUDIOBOOKS
    loadAudiobooks() {
        this.audiobooksLoading.set(true);
        const currentId = this.currentAudiobook()?._id || null;
        this.internetAdmin.audiobooksGetAdmin((result: any) => {
            this.audiobooksLoading.set(false);
            if (result && result.success) {
                for (let item of result.audiobooks) {
                    item.coverFileFull = this.utils.getClientUrlForFiles(item.coverFile, item.coverFileMimetype);
                }
                const sorted = this.sortAudiobooks(result.audiobooks || []);
                this.audiobooks.set(sorted);
                if (currentId) {
                    const updated = sorted.find((b: any) => b._id === currentId) || null;
                    this.currentAudiobook.set(updated);
                }
            } else {
                this.audiobooks.set([]);
            }
        });
    }

    private sortAudiobooks(audiobooks: any[]) {
        return [...audiobooks].sort((a, b) => {
            const aPriority = (a.paymentCompleted && a.uploadMethod === 'digital') ? 1 : 0;
            const bPriority = (b.paymentCompleted && b.uploadMethod === 'digital') ? 1 : 0;
            return bPriority - aPriority;
        });
    }

    viewAudiobook(audiobook: any) {
        this.currentAudiobook.set(audiobook);
        this.detailsOpen.set(false);
        this.totalPagesInput.set(String(audiobook.totalPages || ''));
        this.totalChaptersInput.set(String(audiobook.totalChapters || ''));
        this.chapterNumberInput.set('');
        this.pdfTextForConversion.set('');
        this.pdfNameForConversion.set('');
        this.pdfStatus.set('');
        this.selectedPdfFile.set(null);
        this.stories.set([]);
        this.storiesError.set('');
        this.storyExpanded.set({});
        this.storyEditId.set(null);
        this.storyEditError.set('');
        this.storyLanguageInput.set(audiobook.targetLanguage || audiobook.sourceLanguage || '');
        this.revokeAudioUrls();
        this.loadStoriesForCurrentAudiobook();
    }

    backToList() {
        this.currentAudiobook.set(null);
        this.detailsOpen.set(false);
        this.stories.set([]);
        this.storiesError.set('');
        this.storyExpanded.set({});
        this.storyEditId.set(null);
        this.storyEditError.set('');
        this.storyLanguageInput.set('');
        this.revokeAudioUrls();
    }

    updateTotalPages() {
        const current = this.currentAudiobook();
        const totalPages = this.totalPagesInput();
        if (!current || !totalPages) return;
        this.internetAdmin.updateAudiobookTotalPages(
            current._id,
            totalPages,
            (result: any) => {
                if (result && result.success) {
                    alert('¡Total de páginas actualizado correctamente!');
                    this.currentAudiobook.set({
                        ...current,
                        totalPages: parseInt(totalPages, 10)
                    });
                } else {
                    alert('Error al actualizar el total de páginas');
                }
            }
        );
    }

    updateTotalChapters() {
        const current = this.currentAudiobook();
        const totalChapters = this.totalChaptersInput();
        if (!current || !totalChapters) return;
        this.internetAdmin.updateAudiobookTotalChapters(
            current._id,
            totalChapters,
            (result: any) => {
                if (result && result.success) {
                    alert('¡Total de capítulos actualizado correctamente!');
                    this.currentAudiobook.set({
                        ...current,
                        totalChapters: parseInt(totalChapters, 10)
                    });
                } else {
                    alert('Error al actualizar el total de capítulos');
                }
            }
        );
    }

    setSelectedPdfFile(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0] || null;
        this.selectedPdfFile.set(file);
    }

    setSelectedSampleVoiceFile(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0] || null;
        this.selectedSampleVoiceFile.set(file);
    }

    async loadPdfForConversion() {
        const selectedFile = this.selectedPdfFile();
        if (!selectedFile) {
            this.pdfStatus.set('Selecciona un PDF primero.');
            return;
        }
        try {
            await this.ensurePdfJsLoaded();
        } catch (error) {
            console.error('Error loading PDF.js:', error);
            this.pdfStatus.set('No se pudo cargar PDF.js.');
            return;
        }
        if (!this.pdfJsLoaded) {
            this.pdfStatus.set('No se pudo cargar PDF.js.');
            return;
        }

        this.pdfTextForConversion.set('');
        this.pdfNameForConversion.set(selectedFile.name);
        this.pdfStatus.set('Leyendo PDF...');

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfjsLib = (window as any).pdfjsLib;
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            const parsedText = fullText.trim();
            this.pdfTextForConversion.set(parsedText);
            if (!parsedText) {
                this.pdfStatus.set('No se pudo extraer texto del PDF.');
                return;
            }

            this.pdfStatus.set(`PDF cargado: ${selectedFile.name} (${pdf.numPages} páginas, ${parsedText.length} caracteres).`);
        } catch (error) {
            console.error('Error reading PDF:', error);
            this.pdfStatus.set('Error al leer el PDF.');
        }
    }

    convertPdfToMp3() {
        this.convertPdfToMp3WithLanguage();
    }

    private convertPdfToMp3WithLanguage(languageOverride?: string) {
        const current = this.currentAudiobook();
        if (!current) return;
        if (!this.pdfTextForConversion()) {
            alert('Primero carga un PDF válido.');
            return;
        }
        if (!this.chapterNumberInput()) {
            alert('Por favor introduce el número de capítulo');
            return;
        }
        if (!this.totalChaptersInput()) {
            alert('Por favor introduce el total de capítulos que ves en el libro');
            return;
        }
        if (!this.totalPagesInput()) {
            alert('Por favor introduce el total de páginas que ves en el libro');
            return;
        }

        const chapterNumber = parseInt(this.chapterNumberInput(), 10);
        const totalChapters = parseInt(this.totalChaptersInput(), 10);
        const totalPages = parseInt(this.totalPagesInput(), 10);
        const sourceLanguage = current.sourceLanguage;
        const targetLanguage = current.targetLanguage;

        this.conversionStatusVisible.set(true);
        this.conversionStatusType.set('info');
        this.conversionStatusText.set('Convirtiendo a MP3...');

        const stability = current.stability || 50;
        const clarity = current.clarity || 75;

        this.internetAdmin.convertToMP3(
            current._id,
            {
                voiceId: current.voiceId,
                text: this.pdfTextForConversion(),
                modelId: 'eleven_turbo_v2',
                stability: stability / 100,
                similarity: clarity / 100,
                style: current.useExpression ? 0.5 : 0,
                speakerBoost: true,
                outputFormat: 'mp3_44100_128',
                chapterNumber,
                totalChapters,
                totalPages,
                sourceLanguage,
                targetLanguage
            },
            (result: any) => {
                if (result && result.success) {
                    this.conversionStatusText.set('¡Conversión exitosa!');
                    this.conversionStatusType.set('success');
                    this.chapterNumberInput.set('');
                    setTimeout(() => {
                        this.conversionStatusVisible.set(false);
                        this.loadAudiobooks();
                        this.loadStoriesForCurrentAudiobook();
                    }, 1500);
                } else {
                    this.conversionStatusText.set('Error en la conversión: ' + (result?.message || 'Error desconocido'));
                    this.conversionStatusType.set('danger');
                }
            }
        );
    }

    createStoryForLanguage() {
        if (!this.pdfTextForConversion()) {
            alert('Primero carga un PDF válido.');
            return;
        }
        if (!this.storyLanguageInput()) {
            alert('Introduce el idioma para la nueva historia.');
            return;
        }
        this.convertPdfToMp3WithLanguage(this.storyLanguageInput());
    }

    playChapter(chapterNumber: number) {
        const current = this.currentAudiobook();
        if (!current) return;
        if (this.audioLoading()[chapterNumber]) return;

        this.audioLoading.update(map => ({
            ...map,
            [chapterNumber]: true
        }));

        this.internetAdmin.adminAudiobookGetChapterAudio(
            current._id,
            chapterNumber,
            (buffer: ArrayBuffer | null) => {
                this.audioLoading.update(map => ({
                    ...map,
                    [chapterNumber]: false
                }));
                if (!buffer) {
                    alert('No se pudo cargar el audio');
                    return;
                }
                const blob = new Blob([buffer], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                const existing = this.audioUrls()[chapterNumber];
                if (existing) {
                    URL.revokeObjectURL(existing);
                }
                this.audioUrls.update(map => ({
                    ...map,
                    [chapterNumber]: url
                }));
            }
        );
    }

    getOpenFileUrl() {
        const current = this.currentAudiobook();
        if (!current || !current.file) return null;
        const filename = current.file.filename;
        const mimetype = current.file.mimetype;
        if (!filename || !mimetype) return null;
        const encodedMime = btoa(mimetype);
        const SERVER = Config.dev ? Config.SERVER.local : Config.SERVER.remote;
        return `${SERVER}/file/${filename}/${encodedMime}`;
    }

    getLanguageName(code: string) {
        const map: Record<string, string> = {
            en: 'Inglés',
            es: 'Español',
            fr: 'Francés',
            de: 'Alemán',
            it: 'Italiano',
            pt: 'Portugués',
            pl: 'Polaco',
            nl: 'Neerlandés',
            hi: 'Hindi',
            ja: 'Japonés',
            zh: 'Chino',
            ko: 'Coreano',
            ar: 'Árabe',
            ru: 'Ruso'
        };
        return map[code] || code || 'N/D';
    }

    loadStoriesForCurrentAudiobook() {
        const current = this.currentAudiobook();
        if (!current?._id) return;
        this.storiesLoading.set(true);
        this.storiesError.set('');
        this.internetAdmin.getStoriesByAudiobook(current._id, (result: any) => {
            this.storiesLoading.set(false);
            if (result && result.success && Array.isArray(result.stories)) {
                this.stories.set(result.stories);
            } else {
                this.stories.set([]);
                this.storiesError.set(result?.message || 'No se pudieron cargar las historias');
            }
        });
    }

    toggleStoryExpanded(storyId: string) {
        this.storyExpanded.update(map => ({
            ...map,
            [storyId]: !map[storyId]
        }));
    }

    openStoryEditor(story: any) {
        const chapterPieces = Array.isArray(story.chapterPieces)
            ? story.chapterPieces.map((piece: any) => ({
                title: piece?.title || '',
                quote: piece?.quote || '',
                readingText: piece?.readingText || '',
                audioImage: piece?.audioImage || '',
                audioUrl: piece?.audioUrl || '',
                slideIndex: piece?.slideIndex ?? '',
                audioDuration: piece?.audioDuration ?? ''
            }))
            : [];
        this.storyEditId.set(story._id);
        this.storyEditError.set('');
        this.storyEditForm.set({
            title: story.title || '',
            subtitle: story.subtitle || '',
            quote: story.quote || '',
            image: story.image || '',
            author: story.author || '',
            chapterNumber: String(story.chapterNumber ?? ''),
            totalChapters: String(story.totalChapters ?? ''),
            language: story.language || '',
            slideIndex: String(story.slideIndex ?? ''),
            chapterPieces
        });
    }

    closeStoryEditor() {
        this.storyEditId.set(null);
        this.storyEditError.set('');
    }

    setStoryFormField(key: string, value: any) {
        this.storyEditForm.update((form: any) => ({
            ...form,
            [key]: value
        }));
    }

    setStoryPieceField(index: number, key: string, value: any) {
        this.storyEditForm.update((form: any) => ({
            ...form,
            chapterPieces: (form.chapterPieces || []).map((piece: any, i: number) =>
                i === index ? { ...piece, [key]: value } : piece
            )
        }));
    }

    uploadStoryCoverFile(event: Event) {
        this.uploadStoryImageFile(event, -1);
    }

    uploadStoryPieceFile(event: Event, pieceIndex: number) {
        this.uploadStoryImageFile(event, pieceIndex);
    }

    private uploadStoryImageFile(event: Event, pieceIndex: number) {
        const storyId = this.storyEditId();
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0] || null;
        if (!storyId || !file) return;

        this.storyFileUploading.set(true);
        this.storyEditError.set('');
        this.internetAdmin.storyUploadNewFile(storyId, pieceIndex, file, (result: any) => {
            this.storyFileUploading.set(false);
            if (input) input.value = '';
            if (result && result.success && result.story) {
                this.stories.update((list) =>
                    list.map((story) => story._id === result.story._id ? result.story : story)
                );
                this.openStoryEditor(result.story);
            } else {
                this.storyEditError.set(result?.message || 'No se pudo subir la imagen.');
            }
        });
    }

    addStoryPiece() {
        this.storyEditForm.update((form: any) => ({
            ...form,
            chapterPieces: [
                ...(form.chapterPieces || []),
                {
                    title: '',
                    quote: '',
                    readingText: '',
                    audioImage: '',
                    audioUrl: '',
                    slideIndex: (form.chapterPieces || []).length,
                    audioDuration: ''
                }
            ]
        }));
    }

    removeStoryPiece(index: number) {
        this.storyEditForm.update((form: any) => ({
            ...form,
            chapterPieces: (form.chapterPieces || []).filter((_: any, i: number) => i !== index)
        }));
    }

    saveStoryEdits() {
        const storyId = this.storyEditId();
        if (!storyId) return;

        const form = this.storyEditForm();
        const chapterPieces = Array.isArray(form.chapterPieces)
            ? form.chapterPieces.map((piece: any, index: number) => ({
                title: piece?.title || '',
                quote: piece?.quote || '',
                readingText: piece?.readingText || '',
                audioImage: piece?.audioImage || '',
                audioUrl: piece?.audioUrl || '',
                slideIndex: piece?.slideIndex !== '' && piece?.slideIndex !== null && piece?.slideIndex !== undefined
                    ? Number(piece.slideIndex)
                    : index,
                audioDuration: piece?.audioDuration !== '' && piece?.audioDuration !== null && piece?.audioDuration !== undefined
                    ? Number(piece.audioDuration)
                    : undefined
            }))
            : [];

        const payload: any = {
            title: form.title,
            subtitle: form.subtitle,
            quote: form.quote,
            image: form.image,
            author: form.author,
            language: form.language,
            chapterNumber: form.chapterNumber ? Number(form.chapterNumber) : undefined,
            totalChapters: form.totalChapters ? Number(form.totalChapters) : undefined,
            slideIndex: form.slideIndex ? Number(form.slideIndex) : undefined,
            chapterPieces
        };

        this.storyEditSaving.set(true);
        this.storyEditError.set('');

        this.internetAdmin.updateAudiobookStory(storyId, payload, (result: any) => {
            this.storyEditSaving.set(false);
            if (result && result.success) {
                this.closeStoryEditor();
                this.loadStoriesForCurrentAudiobook();
            } else {
                this.storyEditError.set(result?.message || 'No se pudo actualizar la historia.');
            }
        });
    }

    private revokeAudioUrls() {
        Object.values(this.audioUrls()).forEach(url => {
            try {
                URL.revokeObjectURL(url);
            } catch {
                // no-op
            }
        });
        this.audioUrls.set({});
        this.audioLoading.set({});
    }

    private async ensurePdfJsLoaded() {
        if (this.pdfJsLoaded || this.pdfJsLoading) return;
        this.pdfJsLoading = true;

        await this.loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            this.pdfJsLoaded = true;
        }
        this.pdfJsLoading = false;
    }

    private loadScriptOnce(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject();
            document.body.appendChild(script);
        });
    }
}

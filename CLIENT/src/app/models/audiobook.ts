export interface AudiobookModel {

    _id: string,

    userd: string,
    file: any,
    coverFile: string,
    coverFileMimetype: string,
    coverFileFull: string,
    uploadMethod: string,
    referralCode: string,
    totalPrice: number,
    basePrice: number,
    hasReferral: boolean,

    authorId: string,
    sourceLanguage: string,
    targetLanguage: string,
    voiceId: string,
    voiceName: string,
    voiceGender: string,
    voiceUrl: string,    
    useExpression: boolean,
    speechRate: string,
    stability: number,
    clarity: number,
    title: string,
    authorName: string,
    description: string,
    categories: Array<string>,

    paymentCompleted: boolean,
    paymentId: string,
    paymentAmount: number,
    paymentDate: number,
    stripeSessionId: string,

    pipelineStatus: 'uploaded' | 'scanning' | 'ocr_completed' | 'tts_processing' | 'ready' | 'published' | 'failed',
    totalPages: number,
    totalAudioDurationSec: number,
    audioFiles: Array<{
        chapter: number,
        url?: string,
        durationSec: number
    }>,
    published: boolean,
    publishedAt: number,

    enabled: boolean,
    createdAt: number,
    updatedAt: number,

    totalChapters?: number,
    

}

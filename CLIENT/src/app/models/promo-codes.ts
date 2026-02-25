export interface PromoCodeModel {

    _id: string,
    code: string,
    partnerName: string,
    partnerDescription: string,
    website: string,
    language: string,
    linkToCode: string,

    createdAt: number,
    updatedAt: number,
    
}
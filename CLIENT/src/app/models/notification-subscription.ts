export interface NotificationSubscription {
    channel: 'email' | 'app',
    labelEn: string,
    labelEs: string,
    sections: Array<{
        labelEn: string,
        labelEs: string,
        subscriptions: Array<{
            code: string,
            labelEn: string,
            labelEs: string,
            selected: boolean,
        }>
    }>
}
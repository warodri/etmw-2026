import { trigger, state, style, animate, transition, query, stagger, animateChild } from '@angular/animations';

export class AnimationUtils {

    public static getExpandVerticalText() {
        return trigger('expandVerticalText', [
            state('collapsed', style({
                height: '0', // Height is 0 when hidden
                opacity: 0,
                overflow: 'hidden'
            })),
            state('expanded', style({
                height: 'auto',
                padding: '1.5rem',
            })),
            transition('collapsed <=> expanded', [
                animate('300ms ease')
            ])
        ])
    }

    public static getExpandVertical() {
        return trigger('expandVertical', [
            state('collapse', style({
                height: 'auto'
            })),
            state('expand', style({
                height: '70vh',
            })),
            transition('collapse <=> expand', [
                animate('300ms ease-out')
            ])
        ])
    }

    public static getCompressVertically() {
        return trigger('compressVertically', [
            // Initial state: content is hidden
            state('void', style({
                height: '0', // Height is 0 when hidden
                opacity: 0,
                overflow: 'hidden'
            })),
            // When the div is present (expanded)
            state('expanded', style({
                height: '*', // Natural height
                opacity: 1
            })),
            // When the div is absent (compressed)
            state('collapsed', style({
                height: '0px', // Collapsed height
                padding: '0px',
                opacity: 0,
                display: 'none',
                overflow: 'hidden',
            })),
            transition('void => expanded', [
                animate('0.3s ease-out') // Compress smoothly over 0.5s
            ]),
            // Transition from expanded to collapsed
            transition('expanded => collapsed', [
                animate('0.3s ease-out') // Compress smoothly over 0.5s
            ]),
            // Transition from collapsed to expanded
            transition('collapsed => expanded', [
                animate('0.3s ease-in') // Expand smoothly over 0.5s
            ])
        ])
    }

    public static getStaggeredList() {
        return trigger('staggeredList', [
            transition(':enter', [
                query('@rowAnimation', [
                    stagger(100, animateChild()) // Stagger the animations with a 100ms delay
                ])
            ])
        ])
    }

    public static getExpandCollapseToZero() {
        return trigger('expandCollapseToZero', [
            state('collapsed', style({
                width: '0px',
                height: '0px',
                borderRadius: '0px',
                overflow: 'hidden',
            })),
            state('expanded', style({
                width: 'auto',
                minHeight: '250px',
                borderRadius: '10px',
            })),
            transition('collapsed <=> expanded', [
                animate('200ms ease-in-out')
            ])
        ])
    }

    public static getExpandCollapseButton() {
        return trigger('expandCollapse', [
            state('collapsed', style({
                width: '150px',
                height: '60px',
                borderRadius: '5px',
                overflow: 'hidden',
            })),
            state('expanded', style({
                width: '100%',
                height: '60vh',
                position: 'absolute',
                bottom: '0px',
                borderRadius: '30px',
            })),
            transition('collapsed <=> expanded', [
                animate('300ms ease-in-out')
            ])
        ])
    }

    public static getRowAnimation() {
        return trigger('rowAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }), // Start with opacity 0 and below the view
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })) // Animate to full opacity and no translation
            ]),
            transition(':leave', [
                animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(20px)' })) // Leave with the reverse animation
            ])
        ])
    }

    public static getFromTopToBottom() {
        return trigger('fromTopToBottom', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-20px)' }), // Start with opacity 0 and above the view
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })) // Animate to full opacity and no translation
            ]),
            transition(':leave', [
                animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' })) // Leave with the reverse animation
            ])
        ]);
    }

    public static getFromToBottomToTop() {
        return trigger('fromBottomToTop', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(20px)'
                }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })) // Animate to full opacity and no translation
            ]),
            transition(':leave', [
                animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' })) // Leave with the reverse animation
            ])
        ]);
    }

    public static getAnimPopButton() {
        return trigger('popButtons', [
            state('collapsed', style({ transform: 'scale(0)', opacity: 0 })), // Collapsed state
            state('expanded', style({ transform: 'scale(1)', opacity: 1 })), // Expanded state

            transition('collapsed => expanded', [
                animate('100ms ease-in-out')
            ]),
            transition('expanded => collapsed', [
                animate('100ms ease-in-out')
            ])
        ])
    }
}
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-inbox',
    standalone: false,
    templateUrl: './screen-inbox.html',
    styleUrl: './screen-inbox.css',
})
export class ScreenInbox {

    channels = [
        {
          _id: '1',
          userName: 'Maria González',
          userProfile: 'https://i.pravatar.cc/150?img=1',
          lastMessage: 'Hey! I loved your latest book. Would you be interested in a collaboration?',
          lastMessageTime: '2m ago',
          lastMessageType: 'text',
          unreadCount: 2,
          isOnline: true,
          isVerified: true,
          isTyping: false,
          tags: ['collaboration', 'urgent']
        },
        {
          _id: '2',
          userName: 'Tony Martinez',
          userProfile: 'https://i.pravatar.cc/150?img=12',
          lastMessage: 'Hi! I have a question about your book "Away". Do you have signed copies available?',
          lastMessageTime: '15m ago',
          lastMessageType: 'text',
          unreadCount: 1,
          isOnline: false,
          isVerified: false,
          isTyping: false,
          tags: ['question']
        },
        {
          _id: '3',
          userName: 'Romain Dubois',
          userProfile: 'https://i.pravatar.cc/150?img=33',
          lastMessage: 'Thanks for the info! The pricing looks good to me.',
          lastMessageTime: '1h ago',
          lastMessageType: 'text',
          unreadCount: 0,
          isOnline: true,
          isVerified: true,
          isTyping: true,
          tags: []
        },
        {
          _id: '4',
          userName: 'Sarah Johnson',
          userProfile: 'https://i.pravatar.cc/150?img=5',
          lastMessage: 'Sent a voice message',
          lastMessageTime: '3h ago',
          lastMessageType: 'voice',
          unreadCount: 0,
          isOnline: false,
          isVerified: false,
          isTyping: false,
          tags: ['voice-note']
        },
        {
          _id: '5',
          userName: 'Alex Chen',
          userProfile: 'https://i.pravatar.cc/150?img=68',
          lastMessage: 'Check out this cover design I made!',
          lastMessageTime: '5h ago',
          lastMessageType: 'image',
          unreadCount: 0,
          isOnline: true,
          isVerified: true,
          isTyping: false,
          tags: ['design']
        },
        {
          _id: '6',
          userName: 'Emma Wilson',
          userProfile: 'https://i.pravatar.cc/150?img=45',
          lastMessage: 'When is the next chapter coming out?',
          lastMessageTime: 'Yesterday',
          lastMessageType: 'text',
          unreadCount: 0,
          isOnline: false,
          isVerified: false,
          isTyping: false,
          tags: []
        },
        {
          _id: '7',
          userName: 'Lucas Silva',
          userProfile: 'https://i.pravatar.cc/150?img=15',
          lastMessage: 'Perfect! See you at the event.',
          lastMessageTime: '2 days ago',
          lastMessageType: 'text',
          unreadCount: 0,
          isOnline: false,
          isVerified: true,
          isTyping: false,
          tags: ['event']
        },
        {
          _id: '8',
          userName: 'Sophie Anderson',
          userProfile: 'https://i.pravatar.cc/150?img=23',
          lastMessage: 'Thank you so much! I really appreciate it.',
          lastMessageTime: '3 days ago',
          lastMessageType: 'text',
          unreadCount: 0,
          isOnline: true,
          isVerified: false,
          isTyping: false,
          tags: []
        }
      ];

    constructor(
        private router: Router
    ) { }

    goHome() {
        this.router.navigate(['app'])
    }

    hasMore = true; // or false depending on if there are more messages

    loadMore() {
        // your logic to load more messages
    }


}

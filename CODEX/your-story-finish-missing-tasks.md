This componen /Users/warodriguez/Downloads/WALTER/ETMW-2026/CLIENT/src/app/SCREEN/AUDIOBOOK/screen-create-your-story/screen-create-your-story.html is for creating audiobooks with AI. 

- User can also create author's aliases. They are related to a real author: /Users/warodriguez/Downloads/WALTER/ETMW-2026/SERVER/models/author.js and to his logged user: /Users/warodriguez/Downloads/WALTER/ETMW-2026/SERVER/models/user.js

- Once the alias is selected, the user must send the idea to the AI. The AI will create the text for each chapter. All starts with chapter 1.

At this point, a record must be created as a regular audiobook. Like how it's done when adding a new audiobook, here: /Users/warodriguez/Downloads/WALTER/ETMW-2026/SERVER/tasks/audiobook_add.js

- In the UI, the user has a button to regenerate the chapter text as many times as needed. The server must update the audiobook record when a new chapter is created. This is the schema: /Users/warodriguez/Downloads/WALTER/ETMW-2026/SERVER/models/audiobook.js

- Once the user is happy with the chapter text, the user has another button to convert the text to audio.
The user must have selected a voice language and one of the voices as when we select when creating an audiobook, here: /Users/warodriguez/Downloads/WALTER/ETMW-2026/CLIENT/src/app/SCREEN/AUDIOBOOK/screen-upload-audiobook/screen-upload-audiobook.html

- When the voice is created, the information must be shown in the UI. The audiobook chapter and the voice must be updated in the schema: /Users/warodriguez/Downloads/WALTER/ETMW-2026/SERVER/models/audiobook.js
For now, the user can delete the generated voice so it's ready to send and record a new one, by selecting another voice.

- When a new voice is generated, the user cannot regenerate the chapter text. It must remove the generated audio in order to regenerate a chapter text.

- When a new voice is generated, the server must generate itself a Story. As done here normally, when a new audiobook is created: /Users/warodriguez/Downloads/WALTER/ETMW-2026/SERVER/tasks/audiobook_convert_to_mp3.js

Check the functions: 
    let chapterPieces = generate10MinuteText(params.text, audiobook, params, author);
    chapterPieces = await generateStoryTitleAndQuote(audiobook, params, chapterPieces);
    chapterPieces = await generateStoryImages(audiobook, params, chapterPieces);
    chapterPieces = await generate10MinuteAudios(audiobook, params, chapterPieces);

If the user regenerates the chapter text, this story must be removed and regenrated.

Check the given component: /Users/warodriguez/Downloads/WALTER/ETMW-2026/CLIENT/src/app/SCREEN/AUDIOBOOK/screen-create-your-story/screen-create-your-story.html, trace the code and tell me what's missing.

import { Messenger, h } from 'koishi';
import * as JC from 'justchat-mc';
import { JustChatBot } from './bot';

export class JustChatMessenger extends Messenger<JustChatBot> {
    private content:string = '';

    public async flush(): Promise<void> {
        const world = this.options.session?.channelId;
        const sender = this.session.bot.internal.send as JC.JustChatServer['sendChatMessage'];
    }
    public async visit(element: h): Promise<void> {
        const { type, attrs, children } = element;
        switch(type){
            case 'text': {
                this.content += attrs.content;
            }
        }
    }
}
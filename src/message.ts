import { Messenger, h } from 'koishi';
import { JustChatBot } from './bot';

export class JustChatMessenger extends Messenger<JustChatBot> {
    public async flush(): Promise<void> {
        
    }
    public async visit(): Promise<void> {
    }
}
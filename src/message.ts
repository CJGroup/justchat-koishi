import { Messenger, h, Logger } from 'koishi';
import * as JC from 'justchat-mc';
import { JustChatBot } from './bot';

const logger = new Logger('justchat')

interface Func {
    function?: string;
    [key: string]: any;
}

interface Content extends Func{
    type: 'text' | 'cqcode'
    content?: string,
}

export class JustChatMessenger extends Messenger<JustChatBot> {
    private content = '';
    private func: Func = {};

    public async flush(): Promise<void> {
        const world = this.session.channelId?this.session.channelId:'';
        const sender = this.session.bot.internal.send as JC.JustChatServer['sendChatMessage'];
        const contents: JC.ChatMessageContent[] = [];
        if(this.func && JSON.stringify(this.func)!='{}'){
            const content:JC.ChatMessageContent = {
                type: 'cqcode',
                content: this.content
            }
            Object.assign(content,this.func);
            contents.push(content);
        } else {
            const content:JC.ChatMessageContent = {
                type: 'text',
                content: this.content,
            }
            contents.push(content);
        }
        const msg = {
            world,
            world_display: this.session.channelName?this.session.channelName:'',
            sender: this.session.username?this.session.username:'',
            content: contents,
        };
        try{
            await sender(msg);
            const session = this.bot.session(this.session);
            session.app.emit(session,'send',session);
            this.results.push(session);
        }catch(e){
            logger.error(e);
        }
        this.func = {};
    }
    public async visit(element: h): Promise<void> {
        const { type, attrs, children } = element;
        switch (type) {
            case 'text': {
                this.content += attrs.content;
                break;
            }
            case 'at': {
                await this.flush();
                this.func = {
                    function: 'CQ:at',
                    target: Buffer.from(attrs.name, 'utf-8').toString('base64')
                };
                break;
            }
            case 'face': {
                await this.flush();
                this.func = {
                    function: 'CQ:face',
                    id: attrs.id
                };
                break;
            }
            case 'onebot:share': {
                await this.flush();
                this.func = {
                    function: 'CQ:share',
                    url: attrs.url,
                    title: attrs.title,
                };
                break;
            }
            default: {
                await this.render(children);
                break;
            }
        }
    }
}

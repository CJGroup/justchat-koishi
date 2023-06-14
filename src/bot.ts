import * as JC from 'justchat-mc';
import { Bot, Context, Fragment, h, Schema, SendOptions, Universal } from 'koishi';
import { adaptUser, generateDefaultUUID } from './utils';
import { JustChatMessenger } from './message';

export class JustChatBot extends Bot<JustChatBot.Config> {
    static platform = 'justchat'
    internal: JC.JustChatServer;

    public constructor(ctx: Context, config: JustChatBot.Config) {
        super(ctx, config);
        this.internal = new JC.JustChatServer({
            name: this.config.name || 'JustChat Bot',
            id: this.config.id || generateDefaultUUID(),
            port: this.config.port,
            host: this.config.host,
            singleMode: this.config.singleMode,
            enableTimeout: this.config.enableTimeout,
            maxConnections: this.config.maxConnections
        });
    }

    public async start(){
        Object.assign(this, await this.getSelf());
        await this.internal.start();
        this.internal.on('chat', (msg)=>{
            const session = this.adaptMessage(msg);
            if(session) this.dispatch(session);
        })
    }

    public async stop():Promise<void> {
        this.internal.close();
        this.offline();
    }

    public async getSelf(): Promise<Universal.User> {
        return adaptUser({
            name: this.config.name || 'JustChat Bot',
            uuid: this.config.id || generateDefaultUUID(),
            bot: true
        });
    }

    public async sendMessage(
        channelId: string,
        content: Fragment,
        guildId?: string | undefined,
        opts?: SendOptions | undefined
    ): Promise<string[]> {
        return await new JustChatMessenger(this,channelId,guildId,opts).send(content);
    }

    public adaptMessage(msg: JC.SendChatMessage){
        const { world, sender, content } = msg;
        const session = this.session({
            type: 'message',
            channelId: world,
        });
        session.username = sender;
        session.content = content[0].content;
        session.elements = h.parse(session.content);
        return session;
    }
}
export namespace JustChatBot {
    export interface BaseConfig {
        port: number;
        name?: string;
        id?: string;
        host?: string;
    }

    export interface ServerConfig {
        singleMode?: boolean,
        enableTimeout?: boolean,
        maxConnections?: number,
    }
    export interface Config extends Bot.Config, BaseConfig, ServerConfig {}
    export const Config = Schema.object({
        port: Schema.number().description('监听端口').default(8080).required(),
        host: Schema.string().description('监听地址').default('localhost'),
        name: Schema.string().description('服务器名称').default('JustChat Bot'),
        id: Schema.string().description('服务器ID').default(generateDefaultUUID()),
    })
}

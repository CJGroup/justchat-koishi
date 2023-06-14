import * as JC from 'justchat-mc';
import { Adapter, Schema } from 'koishi';
import { JustChatBot } from './bot';
import { generateDefaultUUID } from './utils';

export class JCServer extends Adapter.Server<JustChatBot> {
    // @ts-ignore
    private internal: JC.JustChatServer;

    public createServer(config: JC.ServerConfig){
        this.internal = new JC.JustChatServer(config);
    }

    public async start(bot: JustChatBot): Promise<void> {
        Object.assign(bot, await bot.getSelf());
        await this.internal.start();
        this.internal.on('chat', (msg) => {
            const session = bot.adaptMessage(msg);
            if (session) bot.dispatch(session);
        });
    }

    public async stop(bot: JustChatBot): Promise<void> {
        this.internal.close();
        bot.offline();
    }

    public async send(message:JC.SendChatMessage, client?:JC.SimpleClient){
        return this.internal.sendChatMessage(message, client);
    }
}

export namespace JCServer {
    export interface Config {
        singleMode?: boolean,
        enableTimeout?: boolean,
        maxConnections?: number,
    }

    export const config = Schema.object({
        workMode: Schema.const('server').description('工作模式').required(),
        port: Schema.number().description('监听端口').default(8080).required(),
        host: Schema.string().description('监听地址').default('localhost'),
        name: Schema.string().description('服务器名称').default('JustChat Bot'),
        id: Schema.string().description('服务器ID').default(generateDefaultUUID()),
    });
}
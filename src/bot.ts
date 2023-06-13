import * as JC from 'justchat-mc';
import { Bot, Context, Fragment, h, Schema, SendOptions, Universal } from 'koishi';
import { adaptUser, generateDefaultUUID } from './utils';
import { JCServer } from './server';
import { JCClient } from './client';

export class JustChatBot extends Bot<JustChatBot.Config> {
    internal: JCServer | JCClient;

    public constructor(ctx: Context, config: JustChatBot.Config) {
        super(ctx, config);
        switch (this.config.workMode) {
            case 'server':
                this.internal = new JCServer();
                this.internal.createServer({
                    name: this.config.name || 'JustChat Bot',
                    id: this.config.id || generateDefaultUUID(),
                    port: this.config.port,
                    host: this.config.host,
                    singleMode: this.config.singleMode,
                    enableTimeout: this.config.enableTimeout,
                    maxConnections: this.config.maxConnections,
                })
                break;
            case 'client': {
                this.internal = new JCClient();
            }
        }
        ctx.plugin(JCServer, this.config);
    }

    public async getSelf(): Promise<Universal.User> {
        return adaptUser({
            name: this.config.name || 'JustChat Bot',
            uuid: this.config.id || generateDefaultUUID(),
            bot: true
        });
    }

    public async sendMessage(channelId: string, content: Fragment, guildId?: string | undefined, opts?: SendOptions | undefined): Promise<string[]> {
        
    }
}
export namespace JustChatBot {
    export interface BaseConfig {
        workMode: 'server' | 'client';
        port: number;
        name?: string;
        id?: string;
        host?: string;
    }
    export interface Config extends Bot.Config, BaseConfig, JCServer.Config {}
    export const config = Schema.union([
        Schema.object({
            workMode: Schema.const('client').description('工作模式').required(),
            host: Schema.string().description('服务器地址').default('localhost'),
            port: Schema.number().description('服务器端口').default(8080).required(),
            name: Schema.string().description('服务器名称').default('JustChat Bot'),
            id: Schema.string().description('服务器ID').default(generateDefaultUUID())
        })
    ]);
}

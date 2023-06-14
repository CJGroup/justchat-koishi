import * as JC from 'justchat-mc';
import { Bot, Context, Fragment, h, Schema, SendOptions, Universal } from 'koishi';
import { adaptUser, generateDefaultUUID } from './utils';
import { JCServer } from './server';

export class JustChatBot extends Bot<JustChatBot.Config> {
    internal: JCServer;

    public constructor(ctx: Context, config: JustChatBot.Config) {
        super(ctx, config);
        this.internal = new JCServer();
        this.internal.createServer({
            name: this.config.name || 'JustChat Bot',
            id: this.config.id || generateDefaultUUID(),
            port: this.config.port,
            host: this.config.host,
            singleMode: this.config.singleMode,
            enableTimeout: this.config.enableTimeout,
            maxConnections: this.config.maxConnections
        });
        ctx.plugin(JCServer, this.config);
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
    ): Promise<string[]> {}
}
export namespace JustChatBot {
    export interface BaseConfig {
        port: number;
        name?: string;
        id?: string;
        host?: string;
    }
    export interface Config extends Bot.Config, BaseConfig, JCServer.Config {}
    export const config = Schema.intersect([JCServer.config]);
}

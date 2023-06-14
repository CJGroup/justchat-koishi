import * as JC from "justchat-mc";
import {
  Bot,
  Context,
  Fragment,
  h,
  Schema,
  SendOptions,
  Universal,
} from "koishi";
import { adaptUser, generateDefaultUUID } from "./utils";
import { JustChatMessenger } from "./message";

export class JustChatBot extends Bot<JustChatBot.Config> {
  internal: JC.JustChatServer;

  public constructor(ctx: Context, config: JustChatBot.Config) {
    super(ctx, config);
    this.internal = new JC.JustChatServer({
      name: this.config.name || "JustChat Bot",
      id: this.config.id || generateDefaultUUID(),
      port: this.config.port,
      host: this.config.host,
      singleMode: true,
      enableTimeout: this.config.enableTimeout,
    });
  }

  public async start() {
    Object.assign(this, await this.getSelf());
    await this.internal.start();
    this.ctx
      .logger("justchat")
      .info(`服务器启动成功！在${this.config.port}端口监听中`);
    this.internal.on("chat", (msg) => {
      const session = this.adaptMessage(msg);
      if (session) this.dispatch(session);
    });
    this.internal.once("connection", () => this.online());
  }

  public async stop(): Promise<void> {
    this.internal.close();
    this.offline();
  }

  public async getSelf(): Promise<Universal.User> {
    return adaptUser({
      name: this.config.name || "JustChat Bot",
      uuid: this.config.id || generateDefaultUUID(),
      bot: true,
    });
  }

  public async sendMessage(
    channelId: string,
    content: Fragment,
    guildId?: string | undefined,
    opts?: SendOptions | undefined
  ): Promise<string[]> {
    return await new JustChatMessenger(this, channelId, guildId, opts).send(
      content
    );
  }

  public adaptMessage(msg: JC.SendChatMessage) {
    const { world, sender, content } = msg;
    const session = this.session({
      type: "message",
      channelId: world,
      messageId: (Math.floor(Math.random() * 89999999) + 10000000).toString(),
      guildId: world,
      timestamp: Date.now(),
    });
    session.selfId = this.config.id ? this.config.id : "JCBot";
    session.author = adaptUser({
      name: sender,
      bot: false,
    });
    session.userId = session.author.userId;
    session.content = content[0].content;
    session.elements = h.parse(session.content);
    session.subtype = 'group';
    return session;
  }
}

JustChatBot.prototype.platform = "justchat";

export namespace JustChatBot {
  export interface BaseConfig {
    port: number;
    name?: string;
    id?: string;
    host?: string;
  }
  export interface ServerConfig {
    singleMode?: boolean;
    enableTimeout?: boolean;
    maxConnections?: number;
  }
  export interface Config extends Bot.Config, BaseConfig, ServerConfig {}
  export const Config = Schema.object({
    port: Schema.number().description("监听端口").default(8080).required(),
    host: Schema.string().description("监听地址").default("0.0.0.0"),
    name: Schema.string().description("服务器名称").default("JustChat Bot"),
    id: Schema.string().description("服务器ID").default(generateDefaultUUID()),
    enableTimeout: Schema.boolean().description("是否启用超时").default(true),
  });
}

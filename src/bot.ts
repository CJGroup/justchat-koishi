import * as JC from "justchat-mc";
import {
  Bot,
  Context,
  Fragment,
  h,
  SendOptions,
  Universal,
} from "koishi";
import { adaptUser, generateDefaultUUID } from "./utils";
import {} from "@justchat/koishi-plugin-service";
import { JustChatMessenger } from "./message";

declare module 'koishi' {
  namespace Universal {
    interface User {
      selfId: string,
    }
  }
}

export const using = ['justchat'];

export class JustChatBot extends Bot<JustChatBot.Config> {
  private client: JC.SimpleClient;
  public constructor(ctx: Context, config: JustChatBot.Config) {
    super(ctx, config);
    this.client = {
      name: this.config.name,
      uuid: this.config.id,
    }
  }

  public async start() {
    this.ctx.justchat.registerChatListener(this.client, (msg) => this.adaptMessage(msg));
  }

  public async getSelf(): Promise<Universal.User> {
    const user = adaptUser({
      name: this.config.name || "JustChat Bot",
      uuid: this.config.id || generateDefaultUUID(),
      bot: true,
    });
    user['selfId'] = user.userId;
    return user;
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
  export interface Config extends Bot.Config {
    name: string;
    id: string;
  }
}

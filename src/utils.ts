import { User } from "./types";
import { Universal } from "koishi";
import { v5 } from 'uuid';

export const adaptUser = (user: User): Universal.User => ({
    isBot: user.bot,
    userId: user.uuid,
    username: user.name,
    nickname: user.name,
});

export const generateDefaultUUID = (): string => v5('JustChat', v5.DNS);
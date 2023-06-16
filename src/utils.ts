import { User } from "./types";
import { Universal } from "koishi";
import { v5 } from 'uuid';

export const adaptUser = (user: User): Universal.User => ({
    selfId: user.uuid?user.uuid:v5(user.name,v5.DNS),
    userId: user.uuid?user.uuid:v5(user.name,v5.DNS),
    username: user.name,
    nickname: user.name,
});

export const generateDefaultUUID = (): string => v5('JustChat', v5.DNS);
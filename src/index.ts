import {Context} from 'koishi';

export const name='ping';

export function apply(ctx:Context){
    ctx.middleware(async (session, next)=>{
        if(session.content === '天王盖地虎'){
            await session.send('宝塔镇河妖');
            return next();
        }else return next();
    })
}
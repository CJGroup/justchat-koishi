import {App} from 'koishi';
import mock from '@koishijs/plugin-mock';
import {apply} from "../src";

const app=new App();
app.plugin(mock).plugin(apply);

const cli=app.mock.client('123');

before(async ()=>{
    await app.start();
})

it('should correctly respond',()=>{
    cli.shouldReply('天王盖地虎','宝塔镇河妖');
})
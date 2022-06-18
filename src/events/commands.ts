import { App } from '../utils/slack';
import { formatMessage } from '../utils/format';
import restaurants from '../constants/data.json';
import { getLunchtime, getSuggestion } from '../utils/suggest';
import { session, sessionToBlocks, startLunchtime, vote } from '../utils/session';
import { BlockAction, SlackAction } from '@slack/bolt';

const initCommands = (app: App) => {
  app.command('/lunchtime', async ({ command, ack, say, payload }) => {
    // Acknowledge command request
    await ack();
    await say('Lunchtime!');
    startLunchtime(payload.user_name)
    const blocks = sessionToBlocks(payload.user_name)
    console.log('session:', JSON.stringify(session))
    await say({ blocks })
  });

  app.action('vote', async({ body, payload, action, ack, say, respond }) => {
    await ack();
    vote((body as any).user.username, (payload as any).value)
    console.log(session)
    console.log('respond', )
    // @ts-ignore
    await respond({replace_original: true, blocks: sessionToBlocks('blokash')})
    console.log('body')
    console.log(JSON.stringify(body, undefined, 2))
    // body.message.blocks
    console.log('payload')
    console.log(JSON.stringify(payload))
    console.log('action')
    console.log(JSON.stringify(action))
    console.log('session')
    console.log(JSON.stringify(session))
  })

  app.action(/veto-\d+/, async({ ack, say, payload, action }) => {
    await ack()
    console.log('payload')
    console.log(JSON.stringify(payload))
    console.log('action')
    console.log(JSON.stringify(action))
    console.log('session')
    console.log(JSON.stringify(session))
    await say(`veto ${(payload as any).value}` )
  })

  app.command('/suggest', async ({ body, payload, command, ack, say }) => {
    await ack();
    await say(payload.user_name);
    await say(getSuggestion());

  });

  app.action('new-suggestion', async ({ body, payload, ack, say, respond, action }) => {
    await ack();
    await respond(getSuggestion());
  });

  app.command('/time', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    await say('Time!');
  });
};

export { initCommands };

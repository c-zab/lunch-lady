import { App } from '../utils/slack';
import { formatMessage } from '../utils/format';
import restaurants from '../constants/data.json';
import { getLunchtime, getSuggestion } from '../utils/suggest';
import { session, sessionToBlocks, startLunchtime, vote, veto, addTime, resetSession } from '../utils/session';
import { BlockAction, InteractiveAction, SlackAction } from '@slack/bolt';

const initCommands = (app: App) => {
  app.command('/lunchtime', async ({ command, ack, say, payload }) => {
    // Acknowledge command request
    await ack();
    await say('Lunchtime!');
    resetSession();
    startLunchtime('blokash');
    const blocks = sessionToBlocks('blokash');
    console.log('session:', JSON.stringify(session));
    await say({ blocks });
  });

  app.action('vote', async ({ body, payload, action, ack, say, respond }) => {
    await ack();
    vote((body as any).user.username, (payload as any).value);
    // console.log(session)
    // console.log('respond', )
    // @ts-ignore
    await respond({ replace_original: true, blocks: sessionToBlocks('blokash') });
    // console.log('body')
    // console.log(JSON.stringify(body, undefined, 2))
    // body.message.blocks
    // console.log('payload')
    // console.log(JSON.stringify(payload))
    // console.log('action')
    // console.log(JSON.stringify(action))
    // console.log('session')
    // console.log(JSON.stringify(session))
  });

  app.action(/veto-\d+/, async ({ ack, say, body, payload, action, respond }) => {
    await ack();
    // console.log('payload')
    // console.log(JSON.stringify(payload))
    // console.log('action')
    // console.log(JSON.stringify(action))
    // console.log('session')
    // console.log(JSON.stringify(session))
    veto((body as any).user.username, (payload as any).value);
    await respond({ replace_original: true, blocks: sessionToBlocks('blokash') });
  });

  app.action(/selecttime-.*/, async ({ ack, body, payload, action, respond }) => {
    await ack();
    console.log('body');
    console.log(JSON.stringify(body, undefined, 2));
    console.log('action');
    console.log(JSON.stringify(action));

    // restaurantId smuggled in through action_id
    const restaurantId = (action as any).action_id.split('-')[1];

    addTime((body as any).user.username, (action as any).selected_time, restaurantId);
    console.log('session', session);
    await respond({ replace_original: true, blocks: sessionToBlocks('blokash') });
  });

  // app.action('vote-time', async ({ ack, body, payload, action, respond }) => {
  //   await ack()
  //   // console.log('body')
  //   // console.log(JSON.stringify(body, undefined, 2))
  //       console.log('action')
  //   console.log(JSON.stringify(action))
  //   addTime((body as any).user.username, (action as any).value)
  //   await respond({replace_original: true, blocks: sessionToBlocks('blokash')})
  // })

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

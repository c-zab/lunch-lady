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
    await say({ blocks });
  });

  app.action('vote', async ({ body, payload, action, ack, say, respond }) => {
    await ack();
    vote((body as any).user.username, (payload as any).value);

    // @ts-ignore
    await respond({ replace_original: true, blocks: sessionToBlocks('blokash') });
  });

  app.action(/veto-\d+/, async ({ ack, say, body, payload, action, respond }) => {
    await ack();
    veto((body as any).user.username, (payload as any).value);
    await respond({ replace_original: true, blocks: sessionToBlocks('blokash') });
  });

  app.action(/selecttime-.*/, async ({ ack, body, payload, action, respond }) => {
    await ack();
    // restaurantId smuggled in through action_id
    const restaurantId = (action as any).action_id.split('-')[1];

    addTime((body as any).user.username, (action as any).selected_time, restaurantId);
    console.log('session', JSON.stringify(session, undefined, 2));
    await respond({ replace_original: true, blocks: sessionToBlocks('blokash') });
  });

};

export { initCommands };

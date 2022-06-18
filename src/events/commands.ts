import { App } from '../utils/slack';
import { formatMessage } from '../utils/format';
import restaurants from '../constants/data.json';
import { getSuggestion } from '../utils/suggest';

const initCommands = (app: App) => {
  app.command('/lunchtime', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    await say('Lunchtime!');
  });

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
    suggestNew();
  });
};

export { initCommands };

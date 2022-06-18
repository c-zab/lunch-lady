import { App } from '../utils/slack';
import { formatMessage } from '../utils/format';
import restaurants from '../constants/data.json';

const initCommands = (app: App) => {
  app.command('/lunchtime', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    await say('Lunchtime!');
  });

  app.command('/suggest', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    await say('Suggest!');
  });

  app.command('/time', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    await say('Time!');
  });
};

export { initCommands };

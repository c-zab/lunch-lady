import { Block, KnownBlock } from '@slack/bolt';
import { restaurants } from '../constants/data.json';
import { getRandomUniqueSuggestions, getStarRating, formatDistance, getRestaurantById, getCusineEmoji } from '../utils/suggest';
import { SLACK_BOT_OAUTH_TOKEN } from './env';

// @ts-ignore
export type Suggestion = {
  name: string;
  id: string;
  votingUsers: string[];
  type: string;
  address: string;
  rating: number;
  rating_count: number;
  image_url: string;
  url: string;
  distance: number;
};

export type Time = {
  value: string;
  restaurantId: string;
  votingUsers: string[];
};

type Session = {
  [id: string]: { suggestions: Suggestion[]; times: Time[] };
};

let session: Session = {};

const resetSession = () => {
  session = {};
};

const startLunchtime = (user: string) => {
  session[user] = { suggestions: getRandomUniqueSuggestions(3), times: [] };
};

const vote = (user: string, suggestionId: string, sessionId: string = 'blokash') => {
  session[sessionId].suggestions = session[sessionId].suggestions.map((suggestion) => {
    const shouldIncrement = suggestion.id === String(suggestionId);

    const newVotingUsers = suggestion.votingUsers.includes(user)
      ? suggestion.votingUsers.filter((votingUser) => votingUser !== user)
      : [...suggestion.votingUsers, user];
    return {
      ...suggestion,
      votingUsers: shouldIncrement ? newVotingUsers : suggestion.votingUsers,
    };
  });
};

const veto = (user: string, suggestionId: string, sessionId: string = 'blokash') => {
  const theSession = session[sessionId];

  const keepSuggestionIds: string[] = theSession.suggestions
    .filter((s) => s.id !== String(suggestionId))
    .map((s) => s.id);

  session[sessionId].suggestions = theSession.suggestions.map((suggestion) => {
    // can't veto a suggestion that already has votes
    const hasVotes = theSession.times.find((t) => String(t.restaurantId) === suggestion.id && t.votingUsers.length > 0);

    const shouldReplace = !keepSuggestionIds.includes(suggestion.id) && !hasVotes;
    if (shouldReplace) {
      const newSuggestion = getRandomUniqueSuggestions(1, keepSuggestionIds);
      return newSuggestion[0];
    }

    return suggestion;
  });
};

const addTime = (user: string, value: string, restaurantId: string) => {
  let times = session['blokash'].times;

  const isTimeAlreadyIncluded = times.some((t) => t.value === value && t.restaurantId === restaurantId);
  if (!isTimeAlreadyIncluded) {
    times.push({ value, votingUsers: [], restaurantId });
  }

  times = times.map((t) => {
    const shouldChange = t.value === value && t.restaurantId === restaurantId;
    if (!shouldChange) {
      return t;
    }

    const isUserAlreadyIncluded = t.votingUsers.includes(user);

    return {
      ...t,
      votingUsers: isUserAlreadyIncluded
        ? t.votingUsers.filter((votingUser) => votingUser !== user)
        : [...t.votingUsers, user],
    };
  });

  session['blokash'].times = times;
};

const compareTimes = (a: Time, b: Time) => {
  const getComparisonValue = (t: Time) => Number(t.value.replace(':', ''))
  return getComparisonValue(a) - getComparisonValue(b)
}

const sessionToBlocks = (user: string): KnownBlock[] => {
  // main voting
  const blocks: KnownBlock[] = [];

  session[user].suggestions.forEach((s, i) => {
    const timesForSuggestion = session[user].times.filter((t) => String(t.restaurantId) === s.id);

    let textOfTimesForSuggestion = `\n${timesForSuggestion.sort(compareTimes)
      .map((t) => (t.votingUsers.length > 0 ? `${t.value}: ${t.votingUsers.join(', ')}` : ''))
      .join('\n')}`;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${getCusineEmoji(s.type)} *${s.name}*\n${s.address}`,
      },
      fields: [
        {
          type: 'mrkdwn',
          text: `*Rating:* ${s.rating}`,
        },
        {
          type: 'mrkdwn',
          text: `*Rating Count:* ${s.rating_count}`,
        },
        {
          type: 'mrkdwn',
          text: `*Cuisine:* ${s.type}`,
        },
        {
          type: 'mrkdwn',
          text: `*Distance:* ${formatDistance(s.distance)}`,
        },
      ],
      accessory: {
        type: 'image',
        image_url: `${s.image_url}`,
        alt_text: 'alt text for image',
      },
    });

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${textOfTimesForSuggestion}`,
      },
    });

    blocks.push(
      {
        type: 'actions',
        elements: [
          {
            type: 'timepicker',
            // "initial_time": "00:00",
            placeholder: {
              type: 'plain_text',
              text: 'Select time',
            },
            action_id: `selecttime-${s.id}`,
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: `Veto`,
            },
            value: `${s.id}`,
            action_id: `veto-${i}`,
          },
        ],
      },
      {
        type: 'divider',
      }
    );

    return blocks;
  });
  blocks.push(currentLeaderBlock());

  return blocks;
};

const currentLeaderBlock = (): KnownBlock => {
  let times = session['blokash'].times;
  if (times.length > 0) {
    let time = times.reduce((prev, current) => (prev.votingUsers.length > current.votingUsers.length ? prev : current));
    const restaurant = getRestaurantById(time.restaurantId);

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:trophy: Current Leader: ${restaurant} @ ${time.value}`,
      },
    };
  }

  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'No leader yet',
    },
  };
};

export { session, startLunchtime, vote, veto, sessionToBlocks, addTime, resetSession };

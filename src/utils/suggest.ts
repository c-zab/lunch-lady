import { restaurants } from '../constants/data.json';

const getRandomRestaurant = () => {
  return restaurants[Math.floor(Math.random() * restaurants.length)];
};

const restaurantToBlocks = (restaurant: any) => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Suggesting: *${restaurant.name}* ${restaurant.id}`,
    },
  };
};

const newSuggestionButtonBlock = {
  type: 'button',
  text: {
    type: 'plain_text',
    text: 'New suggestion',
    emoji: true,
  },
  value: 'click_me_123',
  action_id: 'new-suggestion',
};

const getSuggestion = (prevSuggestionIds?: Array<number>) => {
  const restaurant = getRandomRestaurant();

  return {
    blocks: [restaurantToBlocks(restaurant), { type: 'actions', elements: [newSuggestionButtonBlock] }],
  };
};

export { getSuggestion };

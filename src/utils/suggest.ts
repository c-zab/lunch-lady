import { restaurants } from '../constants/data.json';
import { Suggestion } from './session';

type Restaurant = { 
  id: number,
  name: string,
  address: string,
  rating: null,
  rating_count: number
}

const getRandomRestaurant = (): Restaurant => {
  return restaurants[Math.floor(Math.random() * restaurants.length)];
}

const getRandomUniqueSuggestions = (numSuggestions: number, excludeIds: number[] = []): Suggestion[] => {
  const restaurants = getRandomUniqueRestaurants(numSuggestions, excludeIds);

  return restaurants.map((restaurant: Restaurant) => ({
    name: restaurant.name,
    id: restaurant.id,
    votingUsers: []
  }))
}

const getRandomUniqueRestaurants = (numRestaurants: number, excludeIds: number[] = []) => {
  let restaurants: Restaurant[] = [];

  while (restaurants.length < numRestaurants) {
    const restaurant = getRandomRestaurant();

    const isRestaurantAlreadyInArray = restaurants.find((r) => (r.id === restaurant.id))
    const isRestaurantInExludedList = excludeIds.includes(restaurant.id)

    if (!isRestaurantAlreadyInArray && !isRestaurantInExludedList) {
      restaurants.push(restaurant);
    }
  }

  return restaurants
}

const restaurantToBlock = (restaurant: any) => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Suggesting: *${restaurant.name}*`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Click Me",
        emoji: true
      },
      value: "1",
      action_id: "vote"
    }
  }
}

const newSuggestionButtonBlock = {
    type: 'button',
    text: {
      type: 'plain_text',
      text: 'New suggestion',
      emoji: true,
    },
    value: 'click_me_123',
    action_id: 'new-suggestion',
  }


const getSuggestion = (prevSuggestionIds?: Array<number>) => {
  const restaurant = getRandomRestaurant();

  return {
    blocks: [
      restaurantToBlock(restaurant),
      { type: 'actions', elements: [newSuggestionButtonBlock] }
    ]
  }
}

const getLunchtime = (): any => {
  const restaurants = getRandomUniqueRestaurants(3);

  const restaurantBlocks = restaurants.map(restaurantToBlock);

  return {
    text: 'restaurants',
    blocks: [
      ...restaurantBlocks,
      { type: 'actions', elements: [newSuggestionButtonBlock] }
    ]
  } 
}

export { getSuggestion, getLunchtime, getRandomUniqueSuggestions }

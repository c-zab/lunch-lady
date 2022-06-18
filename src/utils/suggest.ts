import { restaurants } from '../constants/restaurants.json';
import { Suggestion } from './session';

type Restaurant = {
  id: string;
  alias: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: { alias: string; title: string }[];
  rating: number;
  coordinates: { latitude: number; longitude: number };
  transactions: string[];
  location: {
    address1: string;
    address2: null | string;
    address3: null | string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance: number;
};

const getRandomRestaurant = (): Restaurant => {
  return restaurants[Math.floor(Math.random() * restaurants.length)];
};

const getRandomUniqueSuggestions = (numSuggestions: number, excludeIds: string[] = []): Suggestion[] => {
  const restaurants = getRandomUniqueRestaurants(numSuggestions, excludeIds);

  return restaurants.map((restaurant: Restaurant) => ({
    name: restaurant.name,
    id: restaurant.id,
    votingUsers: [],
    type: restaurant.categories[0].title,
    address: restaurant.location.address1,
    rating: restaurant.rating,
    rating_count: restaurant.review_count,
    image_url: restaurant.image_url,
    url: restaurant.url,
    distance: restaurant.distance,
  }));
};

const getRandomUniqueRestaurants = (numRestaurants: number, excludeIds: string[] = []) => {
  let restaurants: Restaurant[] = [];

  while (restaurants.length < numRestaurants) {
    const restaurant = getRandomRestaurant();

    const isRestaurantAlreadyInArray = restaurants.find((r) => r.id === restaurant.id);
    const isRestaurantInExludedList = excludeIds.includes(restaurant.id);

    if (!isRestaurantAlreadyInArray && !isRestaurantInExludedList) {
      restaurants.push(restaurant);
    }
  }

  return restaurants;
};

const getRestaurantById = (id: string) => {
  return restaurants.find((restaurant) => restaurant.id === id)?.name;
};

const restaurantToBlock = (restaurant: any) => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Suggesting: *${restaurant.name}*`,
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Click Me',
        emoji: true,
      },
      value: '1',
      action_id: 'vote',
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
    blocks: [restaurantToBlock(restaurant), { type: 'actions', elements: [newSuggestionButtonBlock] }],
  };
};

const getLunchtime = (): any => {
  const restaurants = getRandomUniqueRestaurants(3);

  const restaurantBlocks = restaurants.map(restaurantToBlock);

  return {
    text: 'restaurants',
    blocks: [...restaurantBlocks, { type: 'actions', elements: [newSuggestionButtonBlock] }],
  };
};

const getStarRating = (rating: number): string => {
  let star = '';

  for (let i = 0; i < rating; i++) {
    star += ':star:';
  }
  return star;
};

const getCusineEmoji = (cuisine: string) => {
  const map = {
    Pizza: ':pizza:',
    Chicken: 'poultry_leg:',
    Desserts: ':cake:',
    Indian: ':curry:',
    Greek: ':oden:',
    'Juice Bars & Smoothies': ':beverage_box:',
    'Sushi Bars': ':sushi:',
    'Coffee & Tea': ':coffee:',
    Cafes: ':coffee:',
    Chinese: ':takeout_box:',
    Bars: ':beers:',
    Japanese: ':rice_ball:',
    'Asian Fusion': ':chopsticks:',
    'Cocktail Bars': ':tropical_drink:',
    Diners: ':hotdog:',
    Italian: ':spaghetti:',
    Seafood: ':lobster:',
    Thai: ':curry:',
    Mexican: ':taco:',
    Salad: ':green_salad:',
    Korean: ':kr:',
    'Fast Food': ':fries:',
    Sandwiches: ':sandwich:',
    'Chicken Wings': ':chicken:',
    'Breakfast & Brunch': ':fried_egg',
    Vegan: ':broccoli:',
    Burgers: ':hamburger:',
  };
  // @ts-ignore
  return map[cuisine] ?? ':fork_and_knife:';
};

const formatDistance = (distance: number): string => {
  return `${distance.toFixed(2)} m`;
};

export {
  getSuggestion,
  getLunchtime,
  getRandomUniqueSuggestions,
  getStarRating,
  formatDistance,
  getRestaurantById,
  getCusineEmoji,
};

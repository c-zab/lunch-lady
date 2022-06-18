import restaurantsJson from '../constants/data.json';

const suggestNew = () => {
  const index = Math.floor(Math.random() * Object.keys(restaurantsJson.restaurants).length + 1);
  return restaurantsJson.restaurants[index];
};

export { suggestNew };

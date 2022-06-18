import restaurants from '../constants/data.json';

const time = async () => {
  const index = Math.floor(Math.random() * Object.keys(restaurants.restaurants).length);
  console.log(restaurants.restaurants[index].name);
};

time();

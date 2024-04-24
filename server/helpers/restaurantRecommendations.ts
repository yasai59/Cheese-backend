import type RestaurantModel from "../models/Restaurant.model";
import type TasteModel from "../models/Taste.model";
import type RestrictionModel from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import TasteRepository from "../database/Taste.repository";
import DishRepository from "../database/Dish.repository";
import RestrictionRepository from "../database/Restriction.repository";

const tasteRepository = new TasteRepository();
const restrictionRepository = new RestrictionRepository();
const dishRepository = new DishRepository();

const asyncFilter = async (arr: any[], predicate: any) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

export async function filterRestaurants(
  restaurants: RestaurantModel[],
  user: UserModel
): Promise<RestaurantModel[]> {
  const userRestrictions = await restrictionRepository.findUserRestrictions(
    user.id as number
  );

  const filteredRestaurants: RestaurantModel[] = await asyncFilter(
    restaurants,
    async (restaurant: RestaurantModel) => {
      const restaurantDishes = await dishRepository.findRestaurantDishes(
        Number(restaurant.id)
      );

      const total = restaurantDishes.length;
      if (total === 0) return false;
      const cadaUno = 100 / total;

      const canEatPercent: number = restaurantDishes.reduce(
        (acc: any, dish: any) => {
          const canEat = !dish.restrictions.some((restriction: any) => {
            return userRestrictions.includes(restriction);
          });

          return acc + (canEat ? cadaUno : 0);
        },
        0
      );

      console.log(canEatPercent);

      return canEatPercent > 50;
    }
  );

  return filteredRestaurants;
}

export async function rateAndOrderRestaurants(
  restaurants: RestaurantModel[],
  user: UserModel
): Promise<RestaurantModel[]> {
  const userTastes = await tasteRepository.findUserTastes(Number(user.id));

  const ratedRestaurants: RestaurantModel[] = [];

  async function calculateRestaurantRating(restaurant: RestaurantModel) {
    let rating = 0;
    let hasCommonRestriction = false;

    const restaurantDishes = await dishRepository.findRestaurantDishes(
      Number(restaurant.id)
    );
    restaurantDishes.forEach(async (dish) => {
      const dishTaste = await tasteRepository.findDishTastes(Number(dish.id));
      const dishRestriction = await restrictionRepository.findDishRestrictions(
        Number(dish.id)
      );

      const commonRestrictions = dishRestriction.filter((restriction) =>
        user.restrictions.includes(restriction.id)
      );
      if (commonRestrictions.length > 0) {
        hasCommonRestriction = true;
        return;
      }

      const commonTastes = dishTaste.filter((taste) =>
        userTastes.includes(taste)
      );

      if (commonTastes.length > 0 && !hasCommonRestriction) {
        rating++;
      }
    });

    return hasCommonRestriction ? 0 : rating;
  }

  for (const restaurant of restaurants) {
    const rating = await calculateRestaurantRating(restaurant);
    ratedRestaurants.push({ ...restaurant, rating });
  }

  return ratedRestaurants.sort((a, b) => b.rating - a.rating);
}

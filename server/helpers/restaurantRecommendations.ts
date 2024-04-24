import type RestaurantModel from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import TasteRepository from "../database/Taste.repository";
import DishRepository from "../database/Dish.repository";
import RestrictionRepository from "../database/Restriction.repository";

const tasteRepository = new TasteRepository();
const restrictionRepository = new RestrictionRepository();
const dishRepository = new DishRepository();

export async function filterRestaurants(
  restaurants: RestaurantModel[],
  user: UserModel
): Promise<RestaurantModel[]> {
  const userRestrictions = await restrictionRepository.findUserRestrictions(
    user.id as number
  );

  return restaurants.filter((restaurant: RestaurantModel) => {
    const total = restaurant.dishes.length;

    if (total === 0) return false;
    const eachOne = 100 / total;

    const canEatPercent: number = restaurant.dishes.reduce(
      (acc: any, dish: any) => {
        const canEat = !dish.restrictions.some((restriction: any) => {
          return userRestrictions.includes(restriction);
        });

        return acc + (canEat ? eachOne : 0);
      },
      0
    );

    return canEatPercent >= 50;
  });
}

export async function rateAndOrderRestaurants(
  restaurants: RestaurantModel[],
  user: UserModel
): Promise<RestaurantModel[]> {
  return restaurants.sort((a, b) => {
    let aGrade = 0;
    let bGrade = 0;

    a.dishes.forEach((dish: any) => {
      dish.tastes.forEach((taste: any) => {
        if (user.tastes.includes(taste)) {
          aGrade++;
        }
      });
    });

    b.dishes.forEach((dish: any) => {
      dish.tastes.forEach((taste: any) => {
        if (user.tastes.includes(taste)) {
          bGrade++;
        }
      });
    });

    console.log(bGrade, aGrade);

    return bGrade - aGrade;
  });
}

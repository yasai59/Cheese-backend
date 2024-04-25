import type RestaurantModel from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import TasteRepository from "../database/Taste.repository";
import DishRepository from "../database/Dish.repository";
import RestrictionRepository from "../database/Restriction.repository";
import fs from "fs";

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
        const restrictions = dish.restrictions || [];
        const canEat = !restrictions.some((restriction: any) => {
          return userRestrictions.includes(restriction);
        });

        return acc + (canEat ? eachOne : 0);
      },
      0
    );

    return canEatPercent >= 50;
  });
}

export async function orderRestaurants(
  restaurants: RestaurantModel[],
  user: UserModel
): Promise<RestaurantModel[]> {
  const userTastes = await tasteRepository.findUserTastes(user.id as number);
  return restaurants.sort((a, b) => {
    let aGrade = 0;
    let bGrade = 0;

    a.dishes.forEach((dish: any) => {
      dish?.tastes?.forEach((taste: any) => {
        if (userTastes.includes(taste)) {
          aGrade++;
        }
      });
    });

    b.dishes.forEach((dish: any) => {
      dish?.tastes?.forEach((taste: any) => {
        if (userTastes.includes(taste)) {
          bGrade++;
        }
      });
    });

    return bGrade - aGrade;
  });
}

export async function recommend(
  restaurants: RestaurantModel[],
  user: UserModel
) {
  // leer el archivo json con los restaurantes que ya se han recomendado a ese usuario
  // si no hay archivo, crearlo
  if (!fs.existsSync("./recommendations.json")) {
    fs.writeFileSync("./recommendations.json", JSON.stringify({}));
  }

  const recommendations = JSON.parse(
    fs.readFileSync("./recommendations.json").toString()
  );

  // filtrar los restaurantes que ya se han recomendado a ese usuario
  const filteredRestaurants = restaurants.filter(
    (restaurant) => !recommendations[user.id as number]?.includes(restaurant.id)
  );

  // si no hay restaurantes para recomendar, devolver un array vacío
  if (filteredRestaurants.length === 0) return [];

  let defArray = [];
  defArray = filteredRestaurants.slice(0, 3);

  let numRecommend: number = user.lot_number as number;

  if (numRecommend <= 3) {
    return defArray;
  }

  if (numRecommend > 10) {
    numRecommend = 10;
  }

  let restantes: number = numRecommend - 3;
  let numPremium = Math.floor(restantes / 2);

  let premiumArray = [];
  let randomArray: any = [];

  // mirar los proximos 10 restaurantes y si hay alguno premium, meterlo en el array de premium
  let nextRestaurants = restaurants.slice(3, 13);
  for (let rest of nextRestaurants) {
    if (rest.active_subscription) {
      premiumArray.push(rest);
      if (premiumArray.length >= numPremium) {
        break;
      }
    }
  }
  let numRandom = restantes - premiumArray.length;
  // de nextRestaurants, meter aleatoriamente los que no esten en premiumArray en randomArray
  let inserts = 0;
  while (inserts < numRandom && inserts < nextRestaurants.length) {
    let randomRest =
      nextRestaurants[Math.floor(Math.random() * nextRestaurants.length)];
    if (
      !premiumArray.includes(randomRest) &&
      !randomArray.includes(randomRest)
    ) {
      randomArray.push(randomRest);
      nextRestaurants = nextRestaurants.filter((rest) => rest !== randomRest);
      inserts++;
    }
  }

  const finalArray = defArray.concat(premiumArray).concat(randomArray);

  // añaadir los restaurantes recomendados al archivo json
  if (!recommendations[user.id as number]) {
    recommendations[user.id as number] = [];
  }
  finalArray.forEach((restaurant) => {
    recommendations[user.id as number].push(restaurant.id);
  });
  fs.writeFileSync("./recommendations.json", JSON.stringify(recommendations));

  finalArray.sort(() => Math.random() - 0.5);

  return finalArray;
}

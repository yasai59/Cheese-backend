import type RestaurantModel  from "../models/Restaurant.model";
import type TasteModel from "../models/Taste.model";
import type RestrictionModel from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import TasteRepository from "../database/Taste.repository";
import DishRepository from "../database/Dish.repository";
import RestrictionRepository from "../database/Restriction.repository";

export async function filterRestaurants(restaurants: RestaurantModel[], user: UserModel): Promise<RestaurantModel[]> {
    const lotNumber = user.lot_number || 5;
    
    const tasteRepository = new TasteRepository();
    const restrictionRepository = new RestrictionRepository();
    const dishRepository = new DishRepository();

    const userTastes = await tasteRepository.findUserTastes(Number(user.id));

    const userRestrictions = await restrictionRepository.findUserRestrictions(Number(user.id));

    const filteredRestaurants: RestaurantModel[] = [];
    
    for (const restaurant of restaurants) {
        let hasCommonRestriction = false;

        const restaurantDishes = await dishRepository.findRestaurantDishes(Number(restaurant.id));

        console.log("Restaurante " + restaurant.id);
        console.log(restaurantDishes);

        restaurantDishes.forEach(async (dish) => {
            const dishTaste: TasteModel[] = await tasteRepository.findDishTastes(Number(dish.dish_id));
            const dishRestriction: RestaurantModel[] = await restrictionRepository.findDishRestrictions(Number(dish.dish_id));

            const commonRestrictions = dishRestriction.filter((restriction) => userRestrictions.includes(restriction));
            if (commonRestrictions.length > 0) {
                hasCommonRestriction = true;
                return;
            };

            const commonTastes = dishTaste.filter((taste) => userTastes.includes(taste));

            if (commonTastes.length > 0 && !hasCommonRestriction) {
                filteredRestaurants.push(restaurant);
                if (filterRestaurants.length === lotNumber) return;
            }
            
        })
    }
    while (filteredRestaurants.length < lotNumber && restaurants.length > 0) {
        const randomIndex = Math.floor(Math.random() * restaurants.length);
        const randomRestaurant = restaurants[randomIndex];
        if (!filteredRestaurants.includes(randomRestaurant)) {
            filteredRestaurants.push(randomRestaurant);
        }
    }

    return filteredRestaurants;
}

export async function rateAndOrderRestaurants(restaurants: RestaurantModel[], user: UserModel): Promise<RestaurantModel[]> {
    const tasteRepository = new TasteRepository();
    const dishRepository = new DishRepository();
    const restrictionRepository = new RestrictionRepository();

    const userTastes = await tasteRepository.findUserTastes(Number(user.id));

    const ratedRestaurants: RestaurantModel[] = [];

    async function calculateRestaurantRating(restaurant: RestaurantModel) {
        let rating = 0;
        let hasCommonRestriction = false;

        const restaurantDishes = await dishRepository.findRestaurantDishes(Number(restaurant.id));
        restaurantDishes.forEach(async (dish) => {
            const dishTaste = await tasteRepository.findDishTastes(Number(dish.id));
            const dishRestriction = await restrictionRepository.findDishRestrictions(Number(dish.id));

            const commonRestrictions = dishRestriction.filter((restriction) => user.restrictions.includes(restriction.id));
            if (commonRestrictions.length > 0) {
                hasCommonRestriction = true;
                return;
            };

            const commonTastes = dishTaste.filter((taste) => userTastes.includes(taste));

            if (commonTastes.length > 0 && !hasCommonRestriction) {
                rating++;
            }
        })

        return hasCommonRestriction ? 0: rating;
    }

    for (const restaurant of restaurants) {
        const rating = await calculateRestaurantRating(restaurant);
        ratedRestaurants.push({...restaurant, rating});
    }

    return ratedRestaurants.sort((a, b) => b.rating - a.rating);
}
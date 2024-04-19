import type RestaurantModel  from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import TasteRepository from "../database/Taste.repository";
import DishRepository from "../database/Dish.repository";
import RestrictionRepository from "../database/Restriction.repository";
import RestaurantRepository from "../database/Restaurant.repository";
import UserRepository from "../database/User.repository";

export async function filterRestaurants(restaurants: RestaurantModel[], user: UserModel): Promise<RestaurantModel[]> {
    const lotNumber = user.lot_number || 5;
    
    const tasteRepository = new TasteRepository();
    const restrictionRepository = new RestrictionRepository();
    const dishRepository = new DishRepository();

    const userTastes = await tasteRepository.findUserTastes(Number(user.id));

    const filteredRestaurants: RestaurantModel[] = [];
    
    for (const restaurant of restaurants) {
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


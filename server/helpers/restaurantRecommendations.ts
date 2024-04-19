import type RestaurantModel  from "../models/Restaurant.model";
import type UserModel from "../models/User.model";
import TasteRepository from "../database/Taste.repository";
import DishRepository from "../database/Dish.repository";
import RestrictionRepository from "../database/Restriction.repository";

async function filterRestaurants(restaurants: RestaurantModel[], user: UserModel): Promise<RestaurantModel[]> {
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
            
        })
    }
}

import express, { Router } from "express";
import type { Request } from "express";
import { validarCampos } from "../helpers/verifyFields";
import { verifyJWT } from "../middlewares/verifyJWT";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { verifyProperty } from "../middlewares/verifyProperty";
import { verifyRole } from "../middlewares/verifyRole";
import restaurantController from "../controllers/restaurantController";

interface PhotoRequest extends Request {
  photoName?: string | Array<string>;
  pfp?: string;
}

const restaurantRouter: Router = express.Router();

const dir = path.dirname(new URL(import.meta.url).pathname);

const storageCarousel = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(dir, "../../uploads/restaurant_photos/carousel/"));
  },
  filename: (req: PhotoRequest, file, cb) => {
    const name =
      req.user?.name +
      "_" +
      uuidv4() +
      Date.now() +
      path.extname(file.originalname);
    if (!req.photoName) {
      req.photoName = [];
    }
    (req.photoName as Array<string>).push(name);
    cb(null, name);
  },
});

const storageProfilePicture = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(dir, "../../uploads/restaurant_photos/profile_pictures/")
    );
  },
  filename: (req: PhotoRequest, file, cb) => {
    const name =
      req.user?.username +
      "_" +
      uuidv4() +
      Date.now() +
      path.extname(file.originalname);
    req.photoName = name;
    cb(null, name);
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photo") {
      cb(null, path.join(dir, "../../uploads/restaurant_photos/carousel/"));
    } else {
      cb(
        null,
        path.join(dir, "../../uploads/restaurant_photos/profile_pictures/")
      );
    }
  },
  filename: (req: PhotoRequest, file, cb) => {
    const name =
      req.user?.username +
      "_" +
      uuidv4() +
      Date.now() +
      path.extname(file.originalname);
    if (file.fieldname === "photo") {
      if (!req.photoName) {
        req.photoName = [];
      }
      (req.photoName as Array<string>).push(name);
    } else {
      req.pfp = name;
    }

    cb(null, name);
  },
});

const uploadCarousel = multer({ storage: storageCarousel });
const uploadProfilePicture = multer({ storage: storageProfilePicture });
const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Restaurant management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RestaurantModel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID of the restaurant
 *         owner_id:
 *           type: integer
 *           description: ID of the owner
 *         name:
 *           type: string
 *           description: Name of the restaurant
 *         address:
 *           type: string
 *           description: Address of the restaurant
 *         creation_date:
 *           type: string
 *           format: date-time
 *           description: Date of creation
 *         link_glovo:
 *           type: string
 *           description: Link to Glovo page
 *         link_just_eat:
 *           type: string
 *           description: Link to Just Eat page
 *         link_uber_eats:
 *           type: string
 *           description: Link to Uber Eats page
 *         phone:
 *           type: string
 *           description: Phone number of the restaurant
 *         photo:
 *           type: string
 *           description: URL of the restaurant's photo
 *         description:
 *           type: string
 *           description: Description of the restaurant
 *       required:
 *         - name
 */

/**
 * @swagger
 * /api/restaurant/photo/carousel:
 *   post:
 *     tags:
 *      - Restaurant
 *     summary: Upload carousel photos for a restaurant
 *     description: Upload carousel photos for a specified restaurant.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               id:
 *                 type: integer
 *                 description: ID of the restaurant
 *     responses:
 *       '200':
 *         description: Photos uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 restaurantCarousel:
 *                   $ref: '#/components/schemas/RestaurantModel'
 *       '400':
 *         description: Invalid input data
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.post(
  "/photo/carousel",
  [verifyJWT, verifyProperty, uploadCarousel.array("photo", 12)],
  restaurantController.uploadCarouselPhotos
);

/**
 * @swagger
 * /api/restaurant/photo/carousel/{restaurantId}:
 *   put:
 *     tags:
 *      - Restaurant
 *     summary: Update carousel photos for a restaurant
 *     description: Update carousel photos for a specified restaurant.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         description: ID of the restaurant
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: Restaurant carousel updated successfully
 *       '400':
 *         description: Invalid input data
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.put(
  "/photo/carousel/:restaurantId",
  [verifyJWT, verifyProperty, uploadCarousel.array("photo", 12)],
  restaurantController.updateCarouselPhotos
);

/**
 * @swagger
 * /api/restaurant/photo/profile-picture:
 *   post:
 *     tags:
 *      - Restaurant
 *     summary: Upload profile picture for a restaurant
 *     description: Upload profile picture for a specified restaurant.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               id:
 *                 type: integer
 *                 description: ID of the restaurant
 *     responses:
 *       '201':
 *         description: Profile picture uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 restaurant:
 *                   $ref: '#/components/schemas/RestaurantModel'
 *       '400':
 *         description: Invalid input data
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.post(
  "/photo/profile-picture/:restaurantId",
  [verifyJWT, verifyProperty, uploadProfilePicture.single("photo")],
  restaurantController.uploadProfilePicture
);

/**
 * @swagger
 * /api/restaurant:
 *   post:
 *     tags:
 *      - Restaurant
 *     summary: Create a new restaurant
 *     description: Create a new restaurant.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/RestaurantModel'
 *     responses:
 *       '201':
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 restaurantSaved:
 *                   $ref: '#/components/schemas/RestaurantModel'
 *       '400':
 *         description: Invalid input data
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.post(
  "/",
  [verifyJWT, upload.any(), validarCampos],
  restaurantController.createRestaurant
);

/**
 * @swagger
 * /api/restaurant:
 *   get:
 *     tags:
 *      - Restaurant
 *     summary: Get restaurants by owner
 *     description: Retrieve all restaurants owned by the authenticated user.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantModel'
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.get(
  "/",
  [verifyJWT],
  restaurantController.getRestaurantsByOwner
);

/**
 * @swagger
 * /api/restaurant/profilephoto/{name}:
 *   get:
 *     tags:
 *      - Restaurant
 *     summary: Get restaurant profile photo
 *     description: Get the profile photo of a restaurant by its filename.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Filename of the profile photo
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The restaurant profile photo
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.get(
  "/profilephoto/:name",
  [],
  restaurantController.getProfilePhoto
);

/**
 * @swagger
 * /api/restaurant/carousel/photo/{name}:
 *   get:
 *     tags:
 *      - Restaurant
 *     summary: Get restaurant carousel photo
 *     description: Get a carousel photo of a restaurant by its filename.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Filename of the carousel photo
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The restaurant carousel photo
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.get(
  "/carousel/photo/:name",
  [],
  restaurantController.getCarouselPhoto
);

restaurantRouter.get(
  "/carousel/:restaurantId",
  [],
  restaurantController.getCarouselPhotosById
);

/**
 * @swagger
 * /api/restaurant:
 *   put:
 *     tags:
 *      - Restaurant
 *     summary: Update a restaurant
 *     description: Update an existing restaurant.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestaurantModel'
 *     responses:
 *       '200':
 *         description: Restaurant updated successfully
 *       '400':
 *         description: Invalid input data
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.put(
  "/",
  [verifyJWT, verifyProperty, validarCampos],
  restaurantController.updateRestaurant
);

/**
 * @swagger
 * /api/restaurant/{restaurantId}:
 *   delete:
 *     tags:
 *      - Restaurant
 *     summary: Delete a restaurant
 *     description: Delete an existing restaurant by its ID.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         description: ID of the restaurant
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Restaurant deleted successfully
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.delete(
  "/:restaurantId",
  [verifyJWT, verifyProperty],
  restaurantController.deleteRestaurant
);

/**
 * @swagger
 * /api/restaurant/favorite-restaurants:
 *   get:
 *     tags:
 *      - Restaurant
 *     summary: Get favorite restaurants
 *     description: Retrieve all favorite restaurants of the authenticated user.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of favorite restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantModel'
 *       '404':
 *         description: No favorite restaurants found
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.get(
  "/favorite-restaurants",
  [verifyJWT],
  restaurantController.getFavoriteRestaurants
);

/**
 * @swagger
 * /api/restaurant/favorite-restaurant/{restaurantId}:
 *   post:
 *     tags:
 *      - Restaurant
 *     summary: Add restaurant to favorites
 *     description: Add a restaurant to the user's list of favorite restaurants.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         description: ID of the restaurant
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Favorite restaurant added successfully
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.post(
  "/favorite-restaurant/:restaurantId",
  [verifyJWT],
  restaurantController.addFavoriteRestaurant
);

/**
 * @swagger
 * /api/restaurant/liked-restaurants:
 *   get:
 *     tags:
 *      - Restaurant
 *     summary: Get liked restaurants
 *     description: Retrieve all liked restaurants of the authenticated user.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of liked restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantModel'
 *       '404':
 *         description: No liked restaurants found
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.get(
  "/liked-restaurants",
  [verifyJWT],
  restaurantController.getLikedRestaurants
);

/**
 * @swagger
 * /api/restaurant/like-restaurant/{restaurantId}:
 *   post:
 *     tags:
 *      - Restaurant
 *     summary: Like a restaurant
 *     description: Like a restaurant as the authenticated user.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         description: ID of the restaurant
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Restaurant liked successfully
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.post(
  "/like-restaurant/:restaurantId",
  [verifyJWT],
  restaurantController.addLikedRestaurant
);

/**
 * @swagger
 * /api/restaurant/getAll:
 *   get:
 *     tags:
 *      - Restaurant
 *     summary: Get all restaurants
 *     description: Retrieve all restaurants available in the application.
 *     responses:
 *       '200':
 *         description: A list of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantModel'
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.get(
  "/getAll",
  [verifyJWT, verifyRole(3)],
  restaurantController.getRestaurants
);

/**
 * @swagger
 * /api/restaurant/getRecommendations:
 *   get:
 *     tags:
 *      - Restaurant
 *     summary: Get an array of filtered restaurants for an specific user
 *     description: Retrieve all restaurants available in the application with common tastes and restrictions for users.
 *     responses:
 *       '200':
 *         description: A list of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantModel'
 *       '500':
 *         description: Internal Server Error
 */
restaurantRouter.get(
  "/getRecommendations",
  [verifyJWT],
  restaurantController.recommendRestaurant
);

export default restaurantRouter;

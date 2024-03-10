import { Router } from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateprofilePicture,
    updateUserDetails,
    getAuthorProfile,
    deleteUser 
} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields(
        [{
            name:"profilePicture",
            maxCount: 1
        }]
    ),
    registerUser)

router.route("/login").post(loginUser)


// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword); // Updated HTTP method
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-profile-picture").post(verifyJWT, updateprofilePicture);
router.route("/author-profile").get(getAuthorProfile); // Updated route name
router.route("/delete-user").delete(verifyJWT, deleteUser);
router.route("/update-user-credentials").put(verifyJWT, updateUserDetails);

export default router;
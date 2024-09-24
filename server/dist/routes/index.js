"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
router.post("/review", controllers_1.review_post);
router.post("/reviews", controllers_1.reviews_post);
router.post("/review-delete", controllers_1.rev_del_post);
exports.default = router;

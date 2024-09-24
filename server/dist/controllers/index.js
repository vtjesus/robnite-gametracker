"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rev_del_post = exports.reviews_post = exports.review_post = void 0;
const user_1 = __importDefault(require("../models/user"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const reviews_1 = __importDefault(require("../models/reviews"));
const review_post = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_1.default.findById(req.body.review.user._id).populate("reviews");
    if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
    }
    const userId = req.body.review.user._id;
    const gameId = req.body.review.game;
    const existingReview = yield reviews_1.default.findOne({ author: userId, game: gameId });
    if (existingReview) {
        yield reviews_1.default.findOneAndUpdate({ game: gameId, author: userId }, { status: req.body.review.status, rating: req.body.review.score }, { new: true });
        const reviewInUser = user.reviews.find((review) => review.game.toString() === gameId.toString());
        if (reviewInUser) {
            reviewInUser.status = req.body.review.status;
            reviewInUser.rating = req.body.review.score;
        }
        yield user.save();
        res.status(200).json({ message: "Successfuly updated" });
        return;
    }
    const review = new reviews_1.default({
        game: req.body.review.game,
        rating: req.body.review.score,
        status: req.body.review.status,
        author: req.body.review.user
    });
    if (user.reviews)
        yield review.save();
    (_a = user === null || user === void 0 ? void 0 : user.reviews) === null || _a === void 0 ? void 0 : _a.push(review._id);
    yield user.save();
    res.status(200).json({ message: 'Game added to list!' });
}));
exports.review_post = review_post;
const reviews_post = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(req.body.user._id).populate("reviews");
    res.status(200).json(user === null || user === void 0 ? void 0 : user.reviews);
}));
exports.reviews_post = reviews_post;
const rev_del_post = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_1.default.findByIdAndUpdate(req.body.e.author, {
            $pull: { reviews: req.body.e._id }
        });
        yield reviews_1.default.findByIdAndDelete(req.body.e._id);
        const updatedUser = yield user_1.default.findById(req.body.e.author).populate('reviews');
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error deleting review');
    }
}));
exports.rev_del_post = rev_del_post;

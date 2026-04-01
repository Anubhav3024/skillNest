const express = require("express");
const router = express.Router();
const supportController = require("./controller");

router.get("/categories", supportController.getAllCategories);
router.get("/articles/:categorySlug", supportController.getArticlesByCategory);
router.get("/article/:slug", supportController.getArticleBySlug);
router.get("/search", supportController.searchArticles);
router.get("/legal/:type", supportController.getLegalDocument);
router.post("/contact", supportController.createSupportMessage);

module.exports = router;

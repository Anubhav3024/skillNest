const HelpCategory = require("../../models/help-category");
const HelpArticle = require("../../models/help-article");
const LegalDocument = require("../../models/legal-document");
const SupportMessage = require("../../models/support-message");

const getAllCategories = async (req, res) => {
  try {
    const categories = await HelpCategory.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getArticlesByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = await HelpCategory.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const articles = await HelpArticle.find({ categoryId: category._id })
      .select("title slug isFeatured viewsCount")
      .sort({ title: 1 });

    res.status(200).json({ success: true, data: { category, articles } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await HelpArticle.findOne({ slug }).populate("categoryId", "name slug");
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    // Increment views
    article.viewsCount += 1;
    await article.save();

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchArticles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Query string required" });
    }

    const articles = await HelpArticle.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    })
      .select("title slug")
      .limit(10);

    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLegalDocument = async (req, res) => {
  try {
    const { type } = req.params;
    const document = await LegalDocument.findOne({ type, isActive: true });
    if (!document) {
      return res.status(404).json({ success: false, message: `${type} document not found` });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSupportMessage = async (req, res) => {
  try {
    const { email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ success: false, message: "Email and message are required" });
    }

    const newMessage = await SupportMessage.create({ email, message });
    res.status(201).json({ success: true, data: newMessage, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getArticlesByCategory,
  getArticleBySlug,
  searchArticles,
  getLegalDocument,
  createSupportMessage,
};

const router = require("express").Router();
const { searchCourses, getAllCategories, getAllInstructors } = require("../controllers/discovery-controller");

router.get("/search", searchCourses);
router.get("/categories", getAllCategories);
router.get("/instructors", getAllInstructors);

module.exports = router;

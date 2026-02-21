const express = require("express");
const router = express.Router();
const { createJournalEntry, getJournalEntries, getLatestJournalEntry } = require("../controllers/journalController");
const { protect } = require("../middleware/authMiddleware");

const checkSentimentAccess = require("../middleware/checkSentimentAccess");

router.post("/", protect, checkSentimentAccess, createJournalEntry);
router.get("/", protect, getJournalEntries);
router.get("/latest", protect, getLatestJournalEntry);

module.exports = router;

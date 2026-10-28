/**
 * Test Suite: Customer Reviews Dynamic Updates & Admin Spam Moderation
 */

function calculateReviewMetrics(reviews) {
  const count = reviews.length;
  if (count === 0) {
    return { count: 0, averageRating: null };
  }
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = (sum / count).toFixed(1);
  return { count, averageRating: Number(avg) };
}

function filterSpamReviews(reviews, filterQuery) {
  if (!filterQuery) return reviews;
  const q = filterQuery.toLowerCase();
  return reviews.filter(
    (r) =>
      r.authorName?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
  );
}

function deleteReviewFromList(reviews, reviewId) {
  return reviews.filter((r) => r.id !== reviewId);
}

const tests = [
  {
    name: "Review Calculation: Accurate average rating and count on new reviews",
    run: () => {
      const initialReviews = [
        { id: "rev-1", rating: 5, authorName: "Priya", title: "Love the kurti!", comment: "Great fit" },
        { id: "rev-2", rating: 4, authorName: "Kavitha", title: "Good quality", comment: "Nice fabric" },
      ];
      const metrics = calculateReviewMetrics(initialReviews);
      return metrics.count === 2 && metrics.averageRating === 4.5;
    },
  },
  {
    name: "Review Addition: Adding a 5-star review dynamically updates rating to 4.7",
    run: () => {
      const reviews = [
        { id: "rev-1", rating: 5, authorName: "Priya" },
        { id: "rev-2", rating: 4, authorName: "Kavitha" },
        { id: "rev-3", rating: 5, authorName: "Ananya" },
      ];
      const metrics = calculateReviewMetrics(reviews);
      return metrics.count === 3 && metrics.averageRating === 4.7;
    },
  },
  {
    name: "Admin Spam Moderation: Admin deleting a 1-star spam review removes it immediately",
    run: () => {
      const reviews = [
        { id: "rev-1", rating: 5, authorName: "Priya" },
        { id: "spam-rev-99", rating: 1, authorName: "Spambot", comment: "casino crypto free money" },
      ];
      const afterDeletion = deleteReviewFromList(reviews, "spam-rev-99");
      const metrics = calculateReviewMetrics(afterDeletion);
      return (
        afterDeletion.length === 1 &&
        afterDeletion[0].id === "rev-1" &&
        metrics.averageRating === 5.0 &&
        metrics.count === 1
      );
    },
  },
  {
    name: "Spam Detection & Search: Filter query identifies spam reviews by keyword",
    run: () => {
      const reviews = [
        { id: "rev-1", authorName: "Priya S.", title: "Beautiful dress", comment: "Comfortable material" },
        { id: "rev-2", authorName: "Bot123", title: "asdfghjkl", comment: "click here for discount" },
      ];
      const matched = filterSpamReviews(reviews, "discount");
      return matched.length === 1 && matched[0].id === "rev-2";
    },
  },
  {
    name: "Empty Reviews State: No reviews safely returns count 0 and null rating",
    run: () => {
      const metrics = calculateReviewMetrics([]);
      return metrics.count === 0 && metrics.averageRating === null;
    },
  },
];

console.log("==================================================");
console.log("RUNNING CUSTOMER REVIEWS & ADMIN MODERATION TESTS");
console.log("==================================================");

let passed = 0;
let failed = 0;

for (const t of tests) {
  try {
    const ok = t.run();
    if (ok) {
      console.log(`[PASS] ${t.name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${t.name}`);
      failed++;
    }
  } catch (err) {
    console.error(`[FAIL] ${t.name}:`, err.message);
    failed++;
  }
}

console.log(`\nRESULTS: ${passed}/${tests.length} PASSED (${failed} FAILED)`);
if (failed > 0) process.exit(1);

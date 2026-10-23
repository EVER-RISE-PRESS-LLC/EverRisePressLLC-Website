/** Editorial copy checked against the local EPUB and the existing Chapter 1 sample. */
export const FINANCIAL_HEART_ATTACK_SLUG = "how-to-have-a-financial-heart-attack";
export const BOOK_CONTENT_REVIEW_DATE = "2026-10-24";

export const financialHeartAttackEditorial = {
  introduction: "A personal story about a ten-dollar allowance, payday spending, and the lessons McLeod encountered while working in debt collection.",
  metaDescription: "Explore Lamont D. McLeod’s story of payday spending and debt collection. See the chapters, compare editions, and read Chapter 1 free with email signup.",
  audience: "If you enjoy personal stories that make you pause and reflect, start here. McLeod writes in a direct, conversational voice about choices he made with his own money. The focus is on the story behind those choices and the difficulty of changing a familiar habit.",
  sampleQuote: "Friday was coming, and Friday meant money.",
  sampleContext: "In The Penny Candy Foundation, McLeod remembers earning ten dollars a week for chores. Sunday trips to the candy store and arcade used up the money. The next allowance made it easy to repeat the routine.",
  chapters: [
    { title: "The Penny Candy Foundation", description: "A weekly allowance, penny candy, and the expectation that Friday would bring more money." },
    { title: "The Blueprint I Ignored", description: "His parents kept receipts and planned purchases. He remembers the example he overlooked." },
    { title: "The First Paycheck Syndrome", description: "His first job brings a paycheck and the same urge to spend it before the weekend ends." },
    { title: "Spring Break 1997: My First Real Financial Heart Attack" },
    { title: "The Job Hopping Hustle", description: "Early jobs change, while his spending habits and reliance on the next paycheck continue." },
    { title: "Black Bike Week and Borrowed Time" },
    { title: "The Gas Company Getaway" },
    { title: "Freaknik 1999: The Atlanta Awakening" },
    { title: "The Atlanta Decision" },
    { title: "Moving Day and New Beginnings" },
    { title: "College Life and Collections Calls" },
    { title: "The Roommate Lesson" },
    { title: "CompuCredit and the Man Who Changed Everything", description: "At work in debt collection, conversations with a colleague named Craig challenge his approach to money." },
    { title: "The Awakening Begins", description: "He starts asking questions, then faces the gap between learning a lesson and acting on it." },
    { title: "The Reckoning" },
  ],
  questions: [
    { question: "Can I read a sample before buying?", answer: "Yes. Chapter 1, The Penny Candy Foundation, is free with email signup. It opens on this website so you can try the writing before choosing the full book." },
    { question: "What kind of book is this?", answer: "It is a personal account of spending habits, early jobs, borrowing, and lessons from debt collection. Its fifteen short chapters follow McLeod’s experiences and reflections. They introduce money-management ideas through his story, rather than a step-by-step budgeting course." },
    { question: "Where can I buy the full book?", answer: "Use Choose a retailer to see the current links for eBook and paperback editions. Purchases take place on the retailer’s website. Check the price, format, delivery options, and availability there before ordering." },
  ],
} as const;

export const FORMAT_LABELS: Record<string, string> = {
  EBOOK: "eBook", PAPERBACK: "Paperback", HARDCOVER: "Hardcover", AUDIOBOOK: "Audiobook",
};

/** One edition per format and ISBN; retailer rows can share the same edition. */
export function uniqueEditions<T extends { formatType: string; isbn: string | null }>(formats: T[]): T[] {
  return [...new Map(formats.map(format => [`${format.formatType}:${format.isbn ?? ""}`, format])).values()];
}

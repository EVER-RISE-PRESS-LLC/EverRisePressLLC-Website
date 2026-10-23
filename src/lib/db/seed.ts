import { getDb } from "./index";
import { authors, books, bookFormats } from "./schema";

export async function seed(d1: D1Database) {
  const db = getDb(d1);

  console.log("Seeding database with reviewed book and author content...");

  const LAMONT_BIO = `Lamont D. McLeod is the author of How To Have a Financial Heart Attack: A New Standard for Wealth and Responsibility and the founder of EverRise Press.

The book draws on his experiences with a childhood allowance, payday spending, and work in debt collection. It asks readers to reflect on the habits behind their own spending.

In November 2010, a car accident left McLeod quadriplegic. His mother died thirteen days later.

His wider work includes real estate, home care, and public speaking. On his official website, McLeod shares his background and the work of the organizations he is involved with.

Explore the book below, read the first chapter free with email signup, or visit lamontdmcleod.com for his personal story and speaking work.`;

  const [author] = await db
    .insert(authors)
    .values({
      slug: "lamont-mcleod",
      name: "Lamont D. McLeod",
      title: "Author and founder of EverRise Press",
      bio: LAMONT_BIO,
      avatarUrl: "/images/authors/lamont-mcleod.jpg",
      socialLinks: {
        facebook: "https://www.facebook.com/realestatebroker.lamontmcleod",
        linkedin: "https://www.linkedin.com/in/afhcs/",
      },
    })
    .returning();

  console.log(`✓ Created author: ${author.name}`);

  const chapterOneBody = `<p>IT all started in my childhood. Receiving a weekly allowance, a whopping 10 bucks a week for chores: keeping my room clean, washing dishes, even though my legs would burn from standing in place so long, or at least that was the excuse that I'd tell my parents. Cleaning my bathroom. I didn't mind wiping the mirrors, wiping the sink, sweeping, and even cleaning the tub. But the amount of time it took to convince myself to clean my toilet seemed to take an act of Congress. The amount of Ajax and Scrubbing Bubbles I used to clean the inside and outside of the bowl seemed to disappear. I would wear that toilet wire handle scrubber out. I would imagine that I was sword fighting. Yes, I had a big imagination. The amount of chemicals floating around, I'm surprised I never fainted.</p>

<p>But here's where the financial heart attack begins, right in my childhood bedroom. See, I didn't know it then, but that 10-dollar bill was teaching me the most dangerous lesson of my life: money will always come. Every single Friday, like clockwork, that crisp bill would appear. It didn't matter if I'd blown last week's allowance on Now and Laters and video games. It didn't matter if I had nothing left by Tuesday. Friday was coming, and Friday meant money.</p>

<p>This is how I would go broke immediately. On Sunday after church, shoutout to Mt. Zion, on Washington Rd in High Point. After my mother, who was an Evangelist, would watch me like an eagle staring at its prey because I was known to fall asleep on the back pew surrounded by my friends. If I went to sleep, I couldn't go to the penny candy store 3 doors down from the church. This would feel like the worst punishment ever to a kid. Yes, there were numerous occasions when I didn't make it to the store due to bad behavior.</p>

<p>But back to the story, me and the crew would stroll over and buy penny candy, yes you heard me correctly. It literally was a penny a piece. I know this generation will never experience these glorified penny prices. As I sit here and write, I think about those days and ask, 'Inflation, where?' In addition to the brown bag full of delicious candy, this store had video games. Galaga, Ms. Pac-Man, and my all-time favorite was Pole Position. This is where the competition would begin. It had an actual steering wheel, and you would race in a formula-type scenario. The biggest surprise was that all video games cost a quarter - yes, I said one quarter.</p>

<p>We would line up and drive one by one. Those were some of the best days of my life. I would blow my entire 10 bucks because I had no concept of saving or the 4-quadrant method or anything. My child-size brain could only conceive that by doing my chores, I would receive a fresh new $10 bill next Friday, like clockwork. This repeated behavior stuck in my head. This muscle memory, this financial amnesia, this belief that money is infinite as long as you show up, it's the same mentality that would cost me tens of thousands of dollars in my twenties and thirties. But we'll get to that.</p>`;

  const synopsis = `How To Have a Financial Heart Attack follows Lamont D. McLeod from a ten-dollar childhood allowance to payday spending and work in debt collection. He looks back at choices he repeated and advice he struggled to put into practice.

The story moves through early jobs, borrowed money, a move to Atlanta, and conversations with a colleague named Craig. McLeod describes earning more while still spending what came in. Learning about money gives him questions to work through, but changing his habits takes more than knowing the answers.

Its fifteen short chapters focus on personal experiences and reflection. Read the opening chapter to decide whether McLeod’s direct, conversational style is for you.`;

  const [book] = await db
    .insert(books)
    .values({
      slug: "how-to-have-a-financial-heart-attack",
      title: "How To Have a Financial Heart Attack",
      subtitle: "A New Standard for Wealth and Responsibility",
      synopsis,
      coverImageUrl: "/images/books/financial-heart-attack-cover.webp",
      chapterOneTitle: "The Penny Candy Foundation",
      chapterOneBody,
      authorId: author.id,
      publishedAt: "2026-07-20",
    })
    .returning();

  console.log(`✓ Created book: ${book.title}`);

  const [format] = await db
    .insert(bookFormats)
    .values({
      bookId: book.id,
      formatType: "EBOOK",
      isbn: "9781835567173",
      retailPrice: 4.99,
      currency: "USD",
      distributor: "DRAFT2DIGITAL",
      purchaseUrl: "https://books2read.com/u/4E6eD0",
    })
    .returning();

  console.log(`✓ Created book format: ${format.formatType} ($${format.retailPrice})`);

  console.log("\n✅ Seed complete!");
}

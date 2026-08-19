import { getDb } from "./index";
import { authors, books, bookFormats } from "./schema";

export async function seed(d1: D1Database) {
  const db = getDb(d1);

  console.log("Seeding database with System 4 voice...");

  const LAMONT_BIO = `Lamont D. McLeod doesn't do financial advice. He does financial autopsies.

In November 2010, a car accident left him quadriplegic. Thirteen days later, his mother died. Most people would call that a tragedy. Lamont calls it the moment he stopped lying to himself about what actually matters.

Before the accident, he was the guy calling you about your credit card debt. The irony wasn't lost on him — he was collecting on the same patterns he was living. Every Friday, the paycheck came. Every Monday, it was gone. He was practicing poverty until he became an expert.

Now he's the founder of EverRise Press and HMD Publishing. His debut book, *How To Have a Financial Heart Attack*, is the diagnosis nobody wants but everybody needs. It's not a get-rich-quick scheme. It's a mirror. And most people don't like what they see.

Lamont doesn't believe in motivation. He believes in pattern interrupts. You're not broke because you're lazy. You're broke because you learned to be broke before you could read. And unlearning is harder than any budget app.

He lives what he teaches. Every day is a choice between the patterns that got him here and the systems that will get him where he's going. No inspiration porn. No disability platitudes. Just the brutal math of what works and what doesn't.

If you're looking for a cheerleader, keep scrolling. If you're ready to see your financial chart the way a doctor reads an X-ray, pull up a chair. The diagnosis is free. The cure is up to you.`;

  const [author] = await db
    .insert(authors)
    .values({
      slug: "lamont-mcleod",
      name: "Lamont D. McLeod",
      title: "Founder",
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

  const synopsis = `YOU AREN'T JUST LOSING MONEY—YOU'RE PRACTICING POVERTY UNTIL YOU'RE AN EXPERT.

Most financial disasters aren't sudden; they are built through years of muscle memory and financial amnesia. In this raw, mentorship-driven guide, Lamont D. McLeod traces the path from childhood allowance spent on penny candy to a high-stakes career in debt collections, where he realized he was the very debtor he was calling.

McLeod exposes the invisible cage of the job-hopping hustle and the dangerous belief that money is infinite as long as Friday is coming. Through the wisdom of his mentor, Craig, he reveals a sobering truth: every dollar wasted today is a day of freedom lost tomorrow.

This book is a visceral wake-up call for anyone building their life on the sand of living for the weekend. It is time to stop the cycle of heart-racing stress and start building a foundation that can actually withstand life.`;

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

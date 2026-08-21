INSERT INTO authors (id, slug, name, title, bio, avatar_url, social_links, created_at, updated_at)
VALUES (
  'e3028670-bf30-4247-8c24-54d87c8dcc42',
  'lamont-mcleod',
  'Lamont D. McLeod',
  'Founder',
  'Lamont D. McLeod is the founder of EverRise Press and HMD Publishing, an independent digital publishing house dedicated to delivering transformative financial and personal development content.

Lamont''s journey is one of profound resilience. In November 2010, he survived a life-altering motor vehicle accident that resulted in a C5–C6 spinal cord injury and quadriplegia. Just thirteen days later, he lost his mother — a period that demanded extraordinary physical and personal adaptation all at once.

Rather than defining him by limitation, these experiences forged a "Client to CEO" philosophy. Lamont brings firsthand understanding of what it means to depend on caregivers, navigate accessibility barriers, and maintain independence while living with a significant disability. This perspective became the foundation for his entrepreneurial work, including his role as CEO of Agape Family Healthcare Services.

Today, Lamont channels that same determination into publishing. His debut book, How To Have a Financial Heart Attack, traces the path from childhood penny candy spending to a career in debt collections — exposing the invisible patterns that keep people trapped in financial cycles. It is a visceral wake-up call for anyone building their life on the sand of living for the weekend.',
  '/images/authors/lamont-mcleod.jpg',
  '{"facebook":"https://www.facebook.com/realestatebroker.lamontmcleod","linkedin":"https://www.linkedin.com/in/afhcs/"}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO books (id, slug, title, subtitle, synopsis, cover_image_url, chapter_one_title, chapter_one_body, author_id, published_at, created_at, updated_at)
VALUES (
  'd08dac52-26dc-4595-a19a-dda27e2b3b82',
  'how-to-have-a-financial-heart-attack',
  'How To Have a Financial Heart Attack',
  'A New Standard for Wealth and Responsibility',
  'YOU AREN''T JUST LOSING MONEY—YOU''RE PRACTICING POVERTY UNTIL YOU''RE AN EXPERT.

Most financial disasters aren''t sudden; they are built through years of muscle memory and financial amnesia. In this raw, mentorship-driven guide, Lamont D. McLeod traces the path from childhood allowance spent on penny candy to a high-stakes career in debt collections, where he realized he was the very debtor he was calling.

McLeod exposes the invisible cage of the job-hopping hustle and the dangerous belief that money is infinite as long as Friday is coming. Through the wisdom of his mentor, Craig, he reveals a sobering truth: every dollar wasted today is a day of freedom lost tomorrow.

This book is a visceral wake-up call for anyone building their life on the sand of living for the weekend. It is time to stop the cycle of heart-racing stress and start building a foundation that can actually withstand life.',
  '/images/books/financial-heart-attack-cover.webp',
  'The Penny Candy Foundation',
  '<p>IT all started in my childhood. Receiving a weekly allowance, a whopping 10 bucks a week for chores: keeping my room clean, washing dishes, even though my legs would burn from standing in place so long, or at least that was the excuse that I''d tell my parents. Cleaning my bathroom. I didn''t mind wiping the mirrors, wiping the sink, sweeping, and even cleaning the tub. But the amount of time it took to convince myself to clean my toilet seemed to take an act of Congress. The amount of Ajax and Scrubbing Bubbles I used to clean the inside and outside of the bowl seemed to disappear. I would wear that toilet wire handle scrubber out. I would imagine that I was sword fighting. Yes, I had a big imagination. The amount of chemicals floating around, I''m surprised I never fainted.</p>

<p>But here''s where the financial heart attack begins, right in my childhood bedroom. See, I didn''t know it then, but that 10-dollar bill was teaching me the most dangerous lesson of my life: money will always come. Every single Friday, like clockwork, that crisp bill would appear. It didn''t matter if I''d blown last week''s allowance on Now and Laters and video games. It didn''t matter if I had nothing left by Tuesday. Friday was coming, and Friday meant money.</p>

<p>This is how I would go broke immediately. On Sunday after church, shoutout to Mt. Zion, on Washington Rd in High Point. After my mother, who was an Evangelist, would watch me like an eagle staring at its prey because I was known to fall asleep on the back pew surrounded by my friends. If I went to sleep, I couldn''t go to the penny candy store 3 doors down from the church. This would feel like the worst punishment ever to a kid. Yes, there were numerous occasions when I didn''t make it to the store due to bad behavior.</p>

<p>But back to the story, me and the crew would stroll over and buy penny candy, yes you heard me correctly. It literally was a penny a piece. I know this generation will never experience these glorified penny prices. As I sit here and write, I think about those days and ask, ''Inflation, where?'' In addition to the brown bag full of delicious candy, this store had video games. Galaga, Ms. Pac-Man, and my all-time favorite was Pole Position. This is where the competition would begin. It had an actual steering wheel, and you would race in a formula-type scenario. The biggest surprise was that all video games cost a quarter - yes, I said one quarter.</p>

<p>We would line up and drive one by one. Those were some of the best days of my life. I would blow my entire 10 bucks because I had no concept of saving or the 4-quadrant method or anything. My child-size brain could only conceive that by doing my chores, I would receive a fresh new $10 bill next Friday, like clockwork. This repeated behavior stuck in my head. This muscle memory, this financial amnesia, this belief that money is infinite as long as you show up, it''s the same mentality that would cost me tens of thousands of dollars in my twenties and thirties. But we''ll get to that.</p>',
  'e3028670-bf30-4247-8c24-54d87c8dcc42',
  '2026-07-20',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO book_formats (id, book_id, format_type, isbn, retail_price, currency, distributor, purchase_url, created_at)
VALUES (
  'b4dd29e4-9dd2-4c03-8a76-ba0f51f91981',
  'd08dac52-26dc-4595-a19a-dda27e2b3b82',
  'EBOOK',
  '9781835567173',
  4.99,
  'USD',
  'DRAFT2DIGITAL',
  'https://books2read.com/u/4E6eD0',
  CURRENT_TIMESTAMP
);

INSERT INTO book_formats (id, book_id, format_type, isbn, retail_price, currency, distributor, purchase_url, created_at)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'd08dac52-26dc-4595-a19a-dda27e2b3b82',
    'EBOOK',
    '9781835567173',
    4.99,
    'USD',
    'APPLE_BOOKS',
    'https://geo.itunes.apple.com/us/book/id6793190934?at=1010l9S2',
    CURRENT_TIMESTAMP
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'd08dac52-26dc-4595-a19a-dda27e2b3b82',
    'EBOOK',
    '9781835567173',
    4.99,
    'USD',
    'KOBO',
    'http://click.linksynergy.com/deeplink?murl=http%3A%2F%2Fwww.kobo.com%2Fsearch%3Fquery%3D9781835567173&id=YBM6Ddr8uSs&mid=37217',
    CURRENT_TIMESTAMP
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'd08dac52-26dc-4595-a19a-dda27e2b3b82',
    'PAPERBACK',
    '9781835566930',
    12.99,
    'USD',
    'INGRAMSPARK',
    'https://bookshop.org/search?keywords=9781835566930',
    CURRENT_TIMESTAMP
  );

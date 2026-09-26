// AUREN content library.
// Each pillar has a pool of self-contained "concepts". A concept is a full,
// human-written Reel (hook / body / cta) so output never sounds like AI mad-libs.
// The generator picks whole concepts, then varies caption + hashtags + style.
//
// To expand: just add more objects to any pillar's `concepts` array.
// Quality rules (no fake metrics, no cringe, lowercase-casual) are baked into
// the copy itself — keep new entries in the same voice.

export const PILLARS = {
  founder: {
    label: 'Founder / Building in public',
    defaultTemplate: 'single',
    defaultBackground: 'midnight',
    concepts: [
      {
        id: 'founder-origin',
        hook: 'started AUREN because',
        body: 'i wanted a tarot website\ni actually liked',
        cta: 'accidentally started a business 😭',
        caption:
          'started as a side project.\nsomehow became a whole thing. ✦\n\nbuilding AUREN in public and figuring out what happens next.',
      },
      {
        id: 'founder-realizing',
        hook: 'me realizing people are\nactually using the website\ni built',
        body: 'wait…',
        cta: 'this is no longer a side project',
        caption:
          'not sure when a side project quietly turns into a real thing.\n\nbut it happened. building AUREN in public.',
      },
      {
        id: 'founder-one-person',
        hook: 'building a startup with\n0 employees',
        body: 'CEO: me\nCTO: me\ndesigner: me\nmarketing: me',
        cta: 'customer support:\nunfortunately also me',
        caption:
          'the full AUREN org chart.\n\nit’s just me. and a lot of open browser tabs.',
      },
      {
        id: 'founder-hardest-part',
        hook: 'the hardest part of\nbuilding a product',
        body: 'isn’t coding it',
        cta: 'it’s getting anyone\nto care that it exists',
        caption:
          'nobody warns you that the code is the easy part.\n\nstill figuring out the rest, out loud.',
      },
      {
        id: 'founder-full-time',
        hook: 'building AUREN\nafter my full-time job',
        body: '9-5: software engineer\n5-late: founder',
        cta: 'sleep: a future feature',
        caption:
          'nights and weekends energy.\n\nbuilding the tarot site i always wanted, slowly.',
      },
      {
        id: 'founder-tiny-wins',
        hook: 'things that feel huge\nwhen you build alone',
        body: 'someone shares it\nsomeone comes back\nsomeone says they like it',
        cta: 'tiny wins hit different',
        caption:
          'the small stuff carries the whole thing some weeks.\n\nthank you if you’ve ever clicked around AUREN.',
      },
      {
        id: 'founder-no-roadmap',
        hook: 'nobody hands you\na roadmap',
        body: 'you just build the thing\nand find out',
        cta: 'terrifying. kind of fun.',
        caption: 'no manager, no roadmap, no idea some days.\nstill building AUREN anyway.',
      },
      {
        id: 'founder-shipping-scared',
        hook: 'i still get nervous\nevery time i ship',
        body: 'what if it breaks\nwhat if nobody cares',
        cta: 'ship it anyway.',
        caption: 'the nerves never fully go away.\nyou just ship through them.',
      },
      {
        id: 'founder-why-tarot',
        hook: 'a software engineer\nbuilding a tarot site',
        body: 'yes really.\nno it’s not a joke.',
        cta: 'the considered mind, remember?',
        caption: 'logic and intuition aren’t opposites.\nthat’s the whole thesis of AUREN.',
      },
      {
        id: 'founder-first-user',
        hook: 'the first time a stranger\nused AUREN',
        body: 'someone i’ve never met\ndrew a card',
        cta: 'i stared at that screen\nfor way too long',
        caption: 'the first real stranger felt bigger than any launch.',
      },
      {
        id: 'founder-comparison',
        hook: 'comparing my day-1 product\nto someone’s year-3',
        body: 'a classic\nfounder self-own',
        cta: 'note to self: stop it.',
        caption: 'everyone’s chapter 20 looks better than your chapter 1. build anyway.',
      },
      {
        id: 'founder-weekend',
        hook: 'my weekend plans',
        body: 'fix one bug\n(it’s never one bug)',
        cta: 'see you in 6 hours',
        caption: 'the one-bug lie i tell myself every saturday.',
      },
      {
        id: 'founder-quiet-build',
        hook: 'building quietly\nuntil it’s good',
        body: 'no big launch\nno hype thread',
        cta: 'just the work.',
        caption: 'less announcing, more building. AUREN, slowly and on purpose.',
      },
      {
        id: 'founder-doubt',
        hook: 'the 11pm thought:\nis this even worth it',
        body: 'the 9am thought:\nokay one more feature',
        cta: 'and around we go',
        caption: 'doubt and momentum share the same brain. building through both.',
      },
      {
        id: 'founder-learning',
        hook: 'things building AUREN\ntaught me',
        body: 'code is the easy part\npeople are the hard part',
        cta: 'still learning the hard part',
        caption: 'the technical stuff was never the real challenge.',
      },
      {
        id: 'founder-small-team',
        hook: 'our standup this morning',
        body: 'me: what’s the priority\nalso me: everything',
        cta: 'meeting adjourned',
        caption: 'the solo-founder standup hits different.',
      },
    ],
  },

  tarot: {
    label: 'Tarot / Relationship',
    defaultTemplate: 'relatable',
    defaultBackground: 'midnight',
    concepts: [
      {
        id: 'tarot-watched-story',
        hook: 'he watched your story.',
        body: 'he didn’t text.',
        cta: 'the cards have spoken. 😭',
        caption:
          'the veil is thin and so is his effort.\n\npull a card, get the read you already knew.',
      },
      {
        id: 'tarot-dont-miss-him',
        hook: 'you don’t miss him.',
        body: 'you miss who you\nthought he was.',
        cta: 'sit with that one.',
        caption:
          'sometimes the reading is just permission to see it clearly.\n\n✦',
      },
      {
        id: 'tarot-pick-a-pile',
        hook: 'what are they\nnot telling you?',
        body: 'take a breath.\ntrust the first one\nyour eyes land on.',
        cta: 'pick  1  /  2  /  3',
        caption:
          'pick a pile. comment your number.\n\nfull read waiting on AUREN.',
      },
      {
        id: 'tarot-should-i-text',
        hook: 'should you text\nhim first?',
        body: 'you already pulled\nthe card.',
        cta: 'you’re just hoping\nfor a second opinion.',
        caption:
          'the cards don’t decide for you.\nthey just say the quiet part.',
      },
      {
        id: 'tarot-closure',
        hook: 'still waiting\nfor closure?',
        body: 'closure isn’t a text\nyou’re owed.',
        cta: 'it’s a decision\nyou make.',
        caption:
          'a gentle one for the group chat.\n\n✦',
      },
      {
        id: 'tarot-energy-check',
        hook: 'energy check for\nthe week ahead',
        body: 'less doom-scrolling\nhis profile.',
        cta: 'more minding\nyour own magic.',
        caption:
          'your weekly reminder to log off and pull a card instead.',
      },
      {
        id: 'tarot-mixed-signals',
        hook: 'mixed signals?',
        body: 'no.\nthat’s a clear signal',
        cta: 'you’re just softening it.',
        caption: 'the cards rarely stutter. we do.',
      },
      {
        id: 'tarot-almost',
        hook: 'you and him:\nan “almost”',
        body: 'almost isn’t a relationship.',
        cta: 'it’s a lesson.',
        caption: 'some connections exist to teach, not to stay. ✦',
      },
      {
        id: 'tarot-three-cards',
        hook: 'pick a card\nfor your week',
        body: 'one · rest\ntwo · begin\nthree · release',
        cta: 'comment what you got',
        caption: 'pick a card, comment your number. full read on AUREN.',
      },
      {
        id: 'tarot-not-your-person',
        hook: 'the reading nobody\nwants to hear',
        body: 'he’s not confused.',
        cta: 'he’s just not your person.',
        caption: 'sometimes clarity stings before it frees.',
      },
      {
        id: 'tarot-ex-back',
        hook: 'will they come back?',
        body: 'the better question:',
        cta: 'do you actually\nwant them to?',
        caption: 'the cards answer the question you’re avoiding.',
      },
      {
        id: 'tarot-overthinking',
        hook: 'you’re not intuitive-blocked',
        body: 'you’re just overthinking',
        cta: 'pull one card.\ntrust the first read.',
        caption: 'intuition speaks first. the overthinking comes after.',
      },
      {
        id: 'tarot-slow-love',
        hook: 'the cards on\nslow-burn love',
        body: 'if it’s real\nit can move slowly',
        cta: 'panic isn’t passion.',
        caption: 'a soft reminder that steady is not boring.',
      },
      {
        id: 'tarot-self-first',
        hook: 'today’s pull',
        body: 'the person you keep\nwaiting on',
        cta: 'is supposed to be you.',
        caption: 'the reading was about you the whole time. ✦',
      },
      {
        id: 'tarot-red-flag',
        hook: 'the cards saw\nthe red flag',
        body: 'you saw it too',
        cta: 'you just called it\n“potential.”',
        caption: 'we all reframe red flags once or twice. gently, stop.',
      },
      {
        id: 'tarot-new-moon',
        hook: 'new moon energy',
        body: 'stop asking the cards\nwhat he’s thinking',
        cta: 'ask what you want instead.',
        caption: 'redirect the reading back to you this cycle.',
      },
    ],
  },

  product: {
    label: 'AUREN product',
    defaultTemplate: 'product',
    defaultBackground: 'midnight',
    concepts: [
      {
        id: 'product-no-account',
        hook: 'i wanted tarot',
        body: 'without making an account\nwithout downloading an app\nwithout paying for a reading',
        cta: 'so i built AUREN',
        caption:
          'no login. no app. no paywall.\njust a reading when you want one.',
      },
      {
        id: 'product-pov-no-account',
        hook: 'POV:',
        body: 'you want a tarot reading\nbut don’t want to\ncreate an account',
        cta: 'AUREN, no sign-up needed',
        caption:
          'made the thing i was tired of not finding.\n\nfree reading, zero friction.',
      },
      {
        id: 'product-how-it-works',
        hook: 'how AUREN works',
        body: 'choose your question\ndraw your cards\nread between the signs',
        cta: 'that’s it. that’s the app.',
        caption:
          'three steps, no account, no cost.\n\ntry it whenever the mood hits.',
      },
      {
        id: 'product-why-free',
        hook: 'why is AUREN free?',
        body: 'because i built it\nfor myself first.',
        cta: 'figured you might\nwant it too.',
        caption:
          'not a funnel. just a tarot site i actually wanted to use.',
      },
      {
        id: 'product-no-signup',
        hook: 'tarot apps be like:',
        body: 'sign up\nverify email\nstart 7-day trial',
        cta: 'AUREN: just draw a card',
        caption: 'no account, no trial, no catch. draw and read.',
      },
      {
        id: 'product-two-moods',
        hook: 'AUREN, your way',
        body: 'midnight for the\nlate-night questions',
        cta: 'moonlit for the\nsoft mornings',
        caption: 'two moods, same clarity. which one are you today?',
      },
      {
        id: 'product-privacy',
        hook: 'your readings\nare your business',
        body: 'no account means\nnothing to track',
        cta: 'just you and the cards',
        caption: 'privacy by design. no login, nothing stored about you.',
      },
      {
        id: 'product-instant',
        hook: 'want a reading\nright now?',
        body: 'no download\nno waiting',
        cta: 'link in bio · 10 seconds',
        caption: 'the whole point of AUREN: a reading the moment you want one.',
      },
      {
        id: 'product-not-an-app',
        hook: 'it’s not an app.',
        body: 'it’s a website.\non purpose.',
        cta: 'nothing to install, ever.',
        caption: 'no app store, no updates. just open it and read.',
      },
      {
        id: 'product-question-first',
        hook: 'how AUREN starts',
        body: 'not with a signup.\nwith a question.',
        cta: 'what do you\nwant to know?',
        caption: 'a reading should start with your question, not your email.',
      },
    ],
  },

  relatable: {
    label: 'Relatable / Gen-Z',
    defaultTemplate: 'relatable',
    defaultBackground: 'midnight',
    concepts: [
      {
        id: 'relatable-analytics',
        hook: 'me checking\nAUREN analytics',
        body: '1 new visitor',
        cta: 'me:\ninteresting.\nthe market is responding.',
        caption:
          'ceo of one visitor. still counts.\n\n✦',
      },
      {
        id: 'relatable-one-feature',
        hook: 'me:\ni’ll just add one\ntiny feature',
        body: 'also me\n4 hours later:',
        cta: 'why is nothing\nworking anymore',
        caption:
          'the tiny feature is never tiny.\n\nbuilding AUREN, one rabbit hole at a time.',
      },
      {
        id: 'relatable-launch',
        hook: 'me after pushing\na tiny update',
        body: 'refreshing the site\nlike it’s a launch',
        cta: 'nobody noticed.\ni noticed.',
        caption:
          'small updates, big feelings.\n\n✦',
      },
      {
        id: 'relatable-my-own-user',
        hook: 'me using the tarot site\ni built',
        body: 'asking it about\nmy own life',
        cta: 'and taking the\nanswer personally',
        caption:
          'built AUREN. now AUREN reads me for filth.\n\nfree reading, link in bio.',
      },
      {
        id: 'relatable-checking-phone',
        hook: 'me: i’m over it',
        body: 'also me: checking\nif he saw my story',
        cta: 'the cards are\ndisappointed in us',
        caption: 'healing is not linear and neither is the notification bar.',
      },
      {
        id: 'relatable-one-more',
        hook: 'me at 2am:',
        body: 'just one more\ntarot pull',
        cta: 'for research purposes',
        caption: 'the “one more card” to-do list has no bottom.',
      },
      {
        id: 'relatable-market-research',
        hook: 'me checking analytics\nfor the 5th time today',
        body: 'same 3 numbers.',
        cta: 'fascinating. groundbreaking.',
        caption: 'refreshing the dashboard is my toxic trait.',
      },
      {
        id: 'relatable-ambition',
        hook: 'my five-year plan:',
        body: 'step 1: build AUREN\nstep 2: ???\nstep 3: tarot empire',
        cta: 'the ??? is doing\na lot of work',
        caption: 'the roadmap is mostly vibes and one very confident arrow.',
      },
      {
        id: 'relatable-notifications',
        hook: 'AUREN got\na new visitor',
        body: 'me, spiraling:\nwho are they\nhow did they find us',
        cta: 'are they okay',
        caption: 'every single visitor gets a full investigation.',
      },
      {
        id: 'relatable-explain-job',
        hook: 'relatives: so what\ndo you do?',
        body: 'me: i built a\ntarot website',
        cta: 'them: …the computer?',
        caption: 'explaining “indie tarot founder” at family dinner is a sport.',
      },
      {
        id: 'relatable-perfect',
        hook: 'me: it needs to be\nperfect before i post',
        body: 'the post, waiting,\nfor 3 weeks:',
        cta: 'okay fine, posting it',
        caption: 'perfectionism is just procrastination in a nicer outfit.',
      },
    ],
  },

  experimental: {
    label: 'Experimental',
    defaultTemplate: 'single',
    defaultBackground: 'moonlit',
    concepts: [
      {
        id: 'experimental-quiet',
        hook: 'a quiet reminder',
        body: 'you’re allowed to\noutgrow the version\nof you that settled.',
        cta: '✦',
        caption:
          'a softer one today.\n\ntake what serves you, leave the rest.',
      },
      {
        id: 'experimental-two-modes',
        hook: 'AUREN has two moods',
        body: 'midnight\nfor the late-night reads',
        cta: 'moonlit\nfor the soft mornings',
        caption:
          'same tarot, two moods.\nwhich one are you today?',
      },
      {
        id: 'experimental-considered',
        hook: 'tarot for the\nconsidered mind',
        body: 'not to predict.\nto reflect.',
        cta: 'that’s the whole idea.',
        caption:
          'AUREN isn’t here to tell your future.\nit’s here to help you think.',
      },
      {
        id: 'experimental-permission',
        hook: 'a quiet permission slip',
        body: 'you can change your mind.\nyou can start over.',
        cta: 'you can want more.',
        caption: 'take what serves you, leave the rest. ✦',
      },
      {
        id: 'experimental-stillness',
        hook: 'the answer you’re\nlooking for',
        body: 'usually arrives\nin the stillness',
        cta: 'not the scrolling.',
        caption: 'less noise, more knowing. a soft one for today.',
      },
      {
        id: 'experimental-both',
        hook: 'you can be\nlogical and intuitive',
        body: 'a spreadsheet\nand a tarot deck',
        cta: 'both. always both.',
        caption: 'the considered mind holds two things at once.',
      },
      {
        id: 'experimental-season',
        hook: 'you’re allowed to\noutgrow a season',
        body: 'even one you\nonce prayed for',
        cta: '✦',
        caption: 'growth sometimes looks like leaving. gently.',
      },
      {
        id: 'experimental-question',
        hook: 'the cards don’t\ngive answers',
        body: 'they give you\nbetter questions',
        cta: 'sit with those.',
        caption: 'a reframe: tarot as a mirror, not a fortune teller.',
      },
    ],
  },
};

// Hashtag pools per pillar. Kept short + relevant (no keyword stuffing).
export const HASHTAGS = {
  founder: ['#BuildInPublic', '#IndieHacker', '#SoloFounder', '#AURENTarot'],
  tarot: ['#TarotReading', '#Tarot', '#TarotTok', '#AURENTarot'],
  product: ['#TarotOnline', '#FreeTarot', '#AURENTarot', '#TarotReading'],
  relatable: ['#BuildInPublic', '#StartupLife', '#AURENTarot'],
  experimental: ['#Tarot', '#AURENTarot', '#TarotForTheConsideredMind'],
};

export const PILLAR_KEYS = Object.keys(PILLARS);

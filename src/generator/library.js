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

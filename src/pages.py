# Page content, taken from the website copy (blue text) in each Google Doc.
# The doc code and version are noted on each page. Section names stand in where a doc gives no heading.
# level: 2 = overview pages, 3 = subpages and company pages, 4 = resources, trust, help and legal.

FINAL = dict(title="Be first when Kai platform opens",
             body="Become the First to know when Kai platform opens in your country.", cta="Become the First")

PAGES = {}

# P-01 Personal overview · doc v0.2
PAGES["P-01"] = dict(
    level=2,
    title="Kai Personal | One account for all your money",
    desc="Fiat, crypto, stablecoins, stocks and cards in one Kai account, with one balance and agents designed to act within your rules.",
    sections=[
        # pinned header like Business overview: the video fills the screen, then draws back into the frame on the right,
        # where the balance panel comes in, centred
        dict(t="hero", variant="pin", ui_center=True, image="/assets/media/personal-hero.jpg",   # still for now, video later
             eyebrow="Kai Personal", h1="One account for all your money",
             sub="Fiat, crypto, stablecoins, stocks and cards, with one balance. Agents are designed to act for you, within your rules.",
             buttons=[("Become the First", "waitlist")],
             visual=dict(title="Total balance", chip="All balances", total=("€", "16825.40", "€16,825.40"),
                         rows=[("€", "Fiat", "EUR, GBP", "€6,240.10"), ("₿", "Crypto", "BTC, ETH", "€5,310.75"),
                               ("◎", "Stablecoins", "USDT, USDC", "€2,904.55"), ("↗", "Stocks", "US-listed", "€2,370.00")])),
        dict(t="tiles", h2="Everything in one place", items=[
            ("account", "Accounts", "EUR and GBP IBANs to start, more currencies to come.", "/personal/accounts/"),
            ("card", "Cards", "Virtual cards funded from your balances.", "/personal/cards/"),
            ("coins", "Crypto & Stablecoins", "Hold, send, convert and trade.", "/personal/crypto/"),
            ("chart", "Invest & Trade", "US-listed stocks in the same account.", "/personal/invest/"),
            ("move", "Move Money", "Any balance to any balance.", "/personal/move-money/"),
            ("agent", "Agents", "Answers questions about your money first. Acting for you comes next.", "/personal/agents/"),
        ]),
        dict(t="split", h2="Hold one thing. Pay with another.",
             body="Hold crypto and pay a bill in euros. The rate and fees are shown before you confirm.",
             cta=("How Move Money works", "/personal/move-money/"), visual=dict(preset="convert", photo="/assets/media/personal-pay.jpg")),   # still for now, video later
        dict(t="cards2", plain=True, h2="Made for you", items=[            # plain: the photos without the cube footage over them
            ("Kai for crypto natives", "Make your crypto work in the fiat world.", "/personal/crypto-natives/", "/assets/media/personal-crypto.jpg"),
            ("Kai for global professionals", "One account for a life across currencies.", "/personal/global-professionals/", "/assets/media/personal-global.jpg"),
        ]),
        dict(t="final", **FINAL),
    ])

# P-02 Accounts · doc v0.2
PAGES["P-02"] = dict(
    level=3,
    title="Accounts | Your own EUR and GBP IBANs | Kai",
    desc="Personal EUR and GBP IBANs in one Kai account. Send by SEPA, SEPA Instant, Faster Payments, CHAPS and BACS, with fees shown first.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Accounts", h1="Your own IBANs in euros and pounds",
             sub="Receive, hold and send EUR and GBP from the same account as your crypto and stocks.",
             buttons=[("Become the First", "waitlist")], visual="accounts"),
        dict(t="flist", h2="What you can do", rows=[
            ("globe", "Your own IBANs.", "Personal virtual IBANs in EUR and GBP, issued after you verify your identity."),
            ("sendrecv", "Send and receive.", "SEPA and SEPA Instant for euros. Faster Payments, CHAPS and BACS for pounds."),
            ("exchange", "Exchange.", "Convert between EUR and GBP, with the rate shown first."),
            ("link", "Request.", "Ask for a payment with a link."),
            ("pie", "See where it goes.", "Transactions sorted by category, with recurring payments spotted for you."),
        ]),
        dict(t="band", h2="Pricing", cta=("Pricing", "/pricing/")),
        dict(t="faq", h2="FAQ", items=[
            ("Which currencies can I hold?", "We start with EUR and GBP, each with its own IBAN. More currencies to come."),
            ("Who provides my account?", "Fiat accounts and payments are provided by our fiat account provider."),
        ]),
        dict(t="promos", items=[("Get your card", "/personal/cards/"), ("Move Money", "/personal/move-money/")]),
        dict(t="final", **FINAL),
    ])

# T-02 Compliance · doc v0.1
PAGES["T-02"] = dict(
    level=4, template="doc",
    title="Compliance | Coin Bridge AG, VQF member | Kai",
    desc="Kai platform is operated by Coin Bridge AG, Zug, a member of VQF (no. 10127), a Swiss SRO supervised by FINMA. See how we meet our obligations.",
    hero=dict(eyebrow="Compliance", h1="A supervised Swiss entity behind Kai platform",
              sub="Who operates Kai platform, how it is supervised, and how we meet our obligations."),
    docsecs=[
        ("operator", "Operator", dict(facts=[
            ("Company", "Coin Bridge AG, trading as KAI"),
            ("Registered office", "Baarerstrasse 25, 6300 Zug, Switzerland"),
            ("Company number", "CHE-110.571.003"),
            ("Supervision", "Member of VQF, a Swiss self-regulatory organisation (SRO) supervised by FINMA, as a financial intermediary under the Swiss Anti-Money Laundering Act (AMLA)."),
            ("VQF member no.", "10127, member since 18 November 2025"),
        ], links=[("Check the VQF member register", "link TBC")])),
        ("european-union", "European Union", dict(p=["MiCA authorisation is planned."])),
        ("obligations", "How we meet our obligations", dict(ul=[
            ("Know your customer.", "Identity verification for individuals (KYC) and business verification for companies (KYB)."),
            ("Ongoing checks.", "Real-time transaction monitoring, sanctions screening and crypto wallet screening."),
            ("Travel Rule.", "Originator and beneficiary information shared with crypto transfers, as FATF requires."),
            ("Regular review.", "Customer information is reassessed periodically."),
        ])),
        ("does-not-do", "What Kai platform does not do", dict(p=[
            "Kai platform does not give investment advice and does not manage portfolios at its own discretion. It executes what you direct."])),
        ("legal-documents", "Legal documents", dict(links=["/privacy-policy/", "/terms-of-use/", "/cookie-policy/"])),
    ])

# R-02 Blog listing · doc v0.1 (articles are samples, see articles.py)
PAGES["R-02"] = dict(
    level=4, template="listing", type="Blog", per_page=9,
    title="Blog | Kai",
    desc="Articles from the Kai team on AI agents, fiat, crypto and stocks in one account.",
    hero=dict(eyebrow="Blog", h1="Blog", sub="Ideas on money, crypto and AI agents, from the Kai team."),
    ui=dict(read_more="Read more", prev="Previous", next="Next", page="Page {n} of {total}", empty="New posts will appear here."),
)

# S-06 HTML sitemap · doc v0.1
PAGES["S-06"] = dict(level=4, template="sitemap", title="Sitemap | Kai",
                     desc="Every page on kai.xyz in one place: Personal, Business, company, resources, trust and legal.")

ARTICLE_TYPES = {"Blog", "News", "Press"}

import pages_personal, pages_business, pages_main, pages_company, pages_more, pages_dummy  # noqa: E402
for _m in (pages_personal, pages_business, pages_main, pages_company, pages_more, pages_dummy):
    PAGES.update(_m.PAGES)

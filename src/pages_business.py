# Business pages B-01 to B-10 (docs v0.2). Website copy only. The docs give no eyebrow, so the page name is used.
from common import WAIT, SALES, FINAL_BIZ, FEES, plans, BIZ_AGENT_LINE, BIZ_PRICING_BAND

PAGES = {}

BIZ_TOTAL = dict(total=("€", "248390.00", "€248,390.00"),
                 rows=[("€", "Fiat", "EUR, GBP", "€182,400.00"), ("₿", "Crypto", "BTC, ETH", "€38,120.00"),
                       ("$", "Stablecoins", "USDT, USDC", "€21,870.00"), ("↗", "Stocks", "US-listed", "€6,000.00")])

PAGES["B-01"] = dict(level=2,
    title="Kai Business | One account for your company. You approve.",
    desc="We're building Kai Business as one account for fiat, crypto, stablecoins and stocks. At the start, Kai's built-in agent answers questions about your business money.",
    sections=[
        # pinned header like Personal › Cards: the video fills the screen, then draws back into the frame on the right,
        # where the balance panel comes in
        dict(t="hero", variant="pin", ui_center=True, video="/assets/media/biz-hero.mp4", eyebrow="Kai Business", h1="One account for your business. You approve.",
             buttons=[WAIT, SALES],
             visual=dict(BIZ_TOTAL, photo="/assets/media/05-business-m.jpg", eager=True, title="Kai Business", chip="One balance")),
        dict(t="text", h2="Your company money still lives in two stacks.",
             body="Fiat in one place, crypto in another, and no safe way for an agent to act on the company's behalf."),
        dict(t="cards", dark=True, h2="One account. One balance. You stay in control.", items=[
            ("account", "Accounts", "A business account with KYB, IBANs for euros and pounds, and one balance for fiat, crypto, stablecoins and US-listed stocks.", "/business/accounts/"),
            ("sendrecv", "Payments", "Send payments, payroll and bill pay from that account. You approve every payment.", "/business/payments/"),
            ("card", "Team cards", "Cards for your team, with spend limits you set.", "/business/cards/"),
            ("link", "API and integrations", "Connect your tools, and later your own agent, once to Kai platform.", "/business/api/"),
        ], line="At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next. You can always use Kai Business yourself."),
        dict(t="split", h2="You approve every payment.",
             body="Kai platform is being built so an AI agent can prepare a payment for your business, and you approve it. At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next. Connecting an agent you already use, through MCP, comes later.",
             ctas=[("How Kai platform works", "/how-kai-works/")],
             visual=dict(photo="/assets/media/07-join-mf.jpg", clip="/assets/media/biz-approve.mp4", title="Kai agent", chip="Waiting for you",
                         msgs=[("me", "How much did we pay suppliers in October?"),
                               ("agent", "€42,180 across 14 payments. Want me to prepare the next supplier run for your approval?")],
                         btn="Review and approve")),
        dict(BIZ_PRICING_BAND, dust=False),                     # no dust over this banner
        dict(t="cards", h2="Three clear next steps.", items=[
            ("key", "Onboarding", "Verify the business, then the account is yours.", "/business/onboarding/", "verify"),
            ("tag", "Pricing", "Silver, Gold and Platinum plans for Business.", "/business/pricing/", "tiers"),
            ("chats", "Talk to sales", "Tell us about your company.", "/business/contact/", "talk"),
        ]),
        dict(t="faq", h2="Questions about Kai Business", items=[
            ("Do we need an AI agent to use Kai Business?", None),
            ("Who owns the account?", "The business that verifies with Kai platform is always the account owner. An agent only works on your behalf, with the access you give it."),
            ("Who is Kai Business for at the start?", "Kai Business is being built first for businesses owned by individuals, and for freelancers who take business payments, with KYB and beneficial-owner checks."),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

PAGES["B-03"] = dict(level=3,
    title="Business accounts | One account for fiat, crypto and stocks",
    desc="A Kai Business account with KYB, IBANs for euros and pounds, and one balance for fiat, crypto, stablecoins and US-listed stocks.",
    sections=[
        # pinned header like Personal › Cards: a particle vault fills the screen, then draws back into the frame on the
        # right, where the account panel comes in, centred
        dict(t="hero", variant="pin", scene="account", ui_center=True, eyebrow="Business accounts", h1="A business account for fiat, crypto and stocks",
             sub="One account, with KYB, your own IBAN for euros and pounds, and one balance.", buttons=[WAIT, SALES],
             visual=dict(BIZ_TOTAL, title="Business account", chip="One balance",
                         kv=[("EUR IBAN", "•••• •••• •••• 7710"), ("GBP IBAN", "•••• •••• •••• 2093")])),
        dict(t="cards", h2="One account. One balance.",
             lead="Kai Business is being built so your company can hold, move and spend fiat, crypto, stablecoins and US-listed stocks from one balance, with the rate and fees shown before you confirm.",
             items=[
                ("kyb", "KYB", "The business is verified, including beneficial-owner checks, and stays the account owner."),
                ("iban", "IBANs", "Your own IBAN for euros and pounds, with more to come later."),
                ("stocks", "US-listed stocks", "Part of the first release, in the same account."),
             ]),
        dict(BIZ_PRICING_BAND, dust=False),                     # no dust over this banner
        # scroll-driven, like the homepage Kai AI section: each step plays its action in the account widget
        dict(t="flow", clip="/assets/media/biz-accounts.mp4", h2="Receive, hold and move, in one place.", steps=[
            ("Receive", "Get paid to your IBAN, or receive crypto and stablecoins."),
            ("Hold", "See fiat, crypto, stablecoins and stocks in one view."),
            ("Move", "Convert or send, with the rate and fees shown first."),
        ], screens=[
            dict(title="Business account", chip="Receiving", total=(248390.00, 265790.00, "€"), rows=[
                ("€", "Incoming SEPA", "Nordlicht GmbH · IBAN •••• 7710", "+€12,400.00"),
                ("◎", "USDC received", "Ethereum network", "+5,000.00 USDC")]),
            dict(title="Business account", chip="One balance", total=(265790.00, 265790.00, "€"), bars=[
                ("€", "Fiat", "€187,400.00", 70), ("₿", "Crypto", "€38,120.00", 15), ("◎", "Stablecoins", "€26,870.00", 10), ("↗", "Stocks", "€13,400.00", 5)]),
            dict(title="Move money", chip="Rate shown first", conv=("You send", "€5,000.00", "EUR", "They receive", "5,412.30 USDC", "USDC"),
                 kv=[("Rate", "1 EUR = 1.0825 USDC"), ("Fee", "€4.50"), ("Arrives", "In a few minutes")], btn="Confirm", done="Sent ✓"),
        ]),
        dict(t="faq", h2="Questions about business accounts", items=[
            ("Which currencies do the IBANs use?", "Kai Business is being built with IBANs for euros and pounds, with more to come later."),
            ("Are stocks in the same account?", "Yes. US-listed stocks are part of the first release, next to the rest of the company's money."),
            ("Who owns the account?", "The business that verifies with Kai platform is always the account owner."),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

PAGES["B-04"] = dict(level=3,
    title="Business payments | Pay suppliers, bills and payroll",
    desc="Kai Business is being built so you can pay suppliers, bills and payroll from one account. You approve every payment.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Payments, payroll and bill pay", h1="Pay suppliers, bills and payroll from one account",
             sub="Kai Business is being built so payments leave the same account that holds your fiat and crypto. You approve every payment.",
             buttons=[WAIT, SALES],
             visual=dict(photo="/assets/media/07-join-mf.jpg", eager=True, title="Payment review", chip="Waiting for you",
                         kv=[("Amount", "€9,600.00"), ("To", "Approved supplier"), ("From", "Euro account"),
                             ("Rate and fees", "Shown before you approve")], btn="Approve")),
        dict(t="cards", h2="One account, three payment jobs.", items=[
            ("sendrecv", "Pay a supplier", "Send a payment from your balance, with the rate and fees shown first."),
            ("doc", "Bill pay", "Kai Business is being built so it can read an invoice and prepare the payment for you to approve. Preparing and executing moves comes next."),
            ("account", "Payroll", "Upload a simple file, review the payments, and approve them."),
        ], line="At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next. You can always make the payment yourself."),
        dict(t="text", dark=True, h2="You approve every payment.",
             body="You review the amount, route and fees, and approve in Kai platform. A budget or permission never replaces your confirmation of a transfer. Kai platform is being built so an agent can prepare the payment first. Preparing and executing moves comes next.",
             links=[("How Kai platform works", "/how-kai-works/")]),
        BIZ_PRICING_BAND,
        dict(t="faq", h2="Questions about payments", items=[
            ("Can an agent send a payment without us?", "No. Kai platform is designed so transfers and withdrawals wait for your confirmation. At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next."),
            ("Can we pay without an agent?", "Yes. You can always use Kai Business yourself, with no agent at all."),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

PAGES["B-05"] = dict(level=3,
    title="Team cards | Spend from the company balance",
    desc="Kai Business is being built so your team can spend from the company balance, within limits you set. You stay in control.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Team cards", h1="Team cards with spend you control",
             sub="Kai Business is being built so your team can spend from the company balance, within limits you set.",
             buttons=[WAIT, SALES],
             visual=dict(title="Team cards", chip="Limits on", card=dict(last="3307", label="Team card"),
                         rows=[("A", "Alex, Marketing", "Limit €2,000 a month", "€640.00"), ("S", "Sam, Sales", "Limit €1,500 a month", "€1,120.00")])),
        dict(t="cards", h2="Spend from the company balance.", items=[
            ("account", "From the company balance", "Cards are designed to spend straight from the Kai Business account, so team spend sits next to the rest of the company's money."),
            ("shield", "Limits", "You set what each card can spend."),
            ("pie", "Visibility", "See team spend in the same account view."),
        ]),
        BIZ_PRICING_BAND,
        dict(t="faq", h2="Questions about team cards", items=[
            ("Where does the spend come from?", "Team cards are designed to spend from the same Kai Business balance that holds your fiat and crypto."),
            ("Who sets the limits?", "You do. The business that owns the account sets the spend limits for each card."),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

PAGES["B-07"] = dict(level=3,
    title="Business API | One connection. Your rules.",
    desc="Kai Business is being built so your tools and, later, your own agent can connect once to Kai platform, within the permissions you set.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="API and integrations", h1="One connection. Your rules.",
             sub="Kai Business is being built so your tools and, later, your own agent can connect once to Kai platform, within the permissions you set.",
             buttons=[WAIT, SALES],
             visual=dict(kind="layers", layers=[("Your tools and agents", "Connect once", False),
                                                ("Kai platform", "Permissions and approvals", True),
                                                ("Financial services", "Payments, crypto, stocks and cards", False)])),
        dict(t="steps", h2="Connect once. Set the limits. You approve.", items=[
            ("Connect once", "An agent or tool connects to Kai platform, not to every provider."),
            ("Set the limits", "You decide what it can see, prepare and request."),
            ("You approve", "Transfers, withdrawals and larger trades wait for your confirmation."),
        ], line="At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next. Connecting your own agent comes later. You can always use Kai Business yourself."),
        dict(t="text", dark=True, h2="Built in first, to answer questions. Your own agent later.",
             body="At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next. Later, you can connect an external agent you already use through MCP (Model Context Protocol), a standard way for an agent to plug into a service with only the access it is given.",
             links=[("How Kai platform works", "/how-kai-works/")]),
        BIZ_PRICING_BAND,
        dict(t="faq", h2="Questions about API and integrations", items=[
            ("Can we connect our own agent at the start?", "Not at the start. Connecting an external agent is planned for a later stage, through MCP. At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next."),
            ("Can a connected agent move money without us?", "No. Kai platform is designed so transfers, withdrawals and larger trades wait for your confirmation."),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

PAGES["B-08"] = dict(level=3,
    title="Business onboarding | Verify the business. Then it's yours.",
    desc="Kai Business starts with KYB: checks on the business and its beneficial owners. The business stays the account owner.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Onboarding and verification", h1="Verify the business. Then the account is yours.",
             sub="Kai Business is designed to start with KYB: checks on the business and its beneficial owners. The business stays the account owner.",
             buttons=[WAIT, SALES],
             visual=dict(title="Onboarding", chip="Step 1 of 3",
                         steps=[("Business details", True), ("Beneficial owners", False), ("Confirmation", False)],
                         kv=[("Company", "Your business"), ("Account owner", "The business"), ("Status", "In review")])),
        dict(t="cards", h2="KYB, in plain terms.", items=[
            ("account", "Beneficial owners", "Ownership is traced to natural persons."),
            ("doc", "Source of funds", "We check the source of funds."),
            ("shield", "Ongoing monitoring", "Checks continue after the account is open."),
        ], line="The business that verifies with Kai platform is always the account owner.",
           ctas=[("Business accounts", "/business/accounts/")]),
        BIZ_PRICING_BAND,
        dict(t="faq", h2="Questions about onboarding", items=[
            ("Who owns the account after verification?", "The business that verifies with Kai platform is always the account owner. An agent only works on your behalf, with the access you give it."),
            ("Do we need an agent to open an account?", None),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

PAGES["B-09"] = dict(level=3,
    title="Business pricing | Silver, Gold and Platinum plans",
    desc="Silver, Gold and Platinum plans for Kai Business. Kai platform is designed to show the rate and fees before you confirm, on every move.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Business pricing", h1="See the cost before you move.",
             sub="Silver, Gold and Platinum plans for Kai Business. Kai platform is designed to show the rate and fees before you confirm.",
             buttons=[WAIT, SALES],
             # particles in place of the frame: a receipt printing and curling towards you, every cost on it
             # (assets/site/particles.js: "receipt")
             shape="receipt"),
        dict(t="plans", h2="Three plans, priced per year.", plans=plans(["€95.88", "€179.88", "€359.88"], ["€179.88", "€119.88", "€0"]),
             line=BIZ_AGENT_LINE),
        dict(t="table", h2="The same plan rates as Personal.",
             lead="Transfers, cards, currency exchange, crypto conversion and trading, and US stock trades follow the same Silver, Gold and Platinum rates as Personal pricing.",
             rows=FEES),
        dict(t="band", dust=False, h2="Personal pricing", cta=("Personal pricing", "/pricing/")),
        dict(t="faq", h2="Questions about Business pricing", items=[
            ("How do Business plans differ from Personal?", "Business and Personal have their own account plan prices. Usage fees follow the same Silver, Gold and Platinum rates. You can also read Personal pricing."),
            ("Do agent features cost extra?", "There is an optional agent plan, priced per year: Silver €179.88, Gold €119.88 and Platinum €0. At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next. If a fee applies, Kai platform is designed to show it before you confirm."),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

PAGES["B-10"] = dict(level=3,
    title="Talk to sales | Kai Business",
    desc="Talk to sales about Kai Business. Tell us about your company and how you move money. Become the First, or send a message.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Contact sales", h1="Talk to sales",
             sub="Tell us about your company and how you move money. We'll come back to you about Kai Business.", buttons=[WAIT],
             visual=dict(BIZ_TOTAL, title="Kai Business", chip="Snapshot")),
        dict(t="form", kind="sales", idp="cs-", h2="Send a message"),
        BIZ_PRICING_BAND,
        dict(t="final", title="Be first when Kai platform opens",
             body="Become the First to know when Kai platform opens in your country, for your business.", ctas=[WAIT]),
    ])

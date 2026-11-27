# Main pages H-02 How Kai Works (v0.4), H-03 Pricing (v0.2), H-04 Why Kai (v0.3). Website copy only.
# The docs' "build bar" above the header is not added: the approved homepage has none.
from common import WAIT, FINAL_ALL, FEES, plans, FEATURES, FEATURES_LINE, AGENT_LINE, BIZ_PRICING_BAND

PAGES = {}

FAQ_AGENT = ("Do I need an AI agent to use Kai platform?", "No. You can always use Kai platform yourself, with no agent at all. Here is who does what. You own the account, set the permissions and approve every sensitive move. Kai's built-in agent is designed to prepare payments and moves for your approval. Your own external agent, such as one you already use, is planned for a later stage. Any agent acts only within the limits you set. At the start, Kai's built-in agent answers questions about your money. Preparing and executing moves comes next.")
FAQ_HOW = ("How do agents work on Kai platform?", "We're building Kai platform so an AI agent can act for you within the permissions you set: it can check balances, prepare a payment or a move, and ask for your approval. Kai platform is designed with its own built-in agent, and later we plan to let you connect an external agent you already use. Every action is logged, every sensitive move waits for your confirmation, and agents do not give investment advice. At the start, Kai's built-in agent answers questions about your money. Preparing and executing moves comes next.")
FAQ_MOVE = ("Can an agent move my money without me?", "No. Kai platform is designed so transfers, withdrawals and larger trades always wait for your confirmation. A budget or permission never replaces your confirmation of a transfer.")
FAQ_ADVICE = ("Does Kai give investment advice?", "No. Kai platform and the agents on it do not give investment advice. You decide what to buy, sell or move.")

PAGES["H-02"] = dict(level=2,
    title="How Kai platform works | Agents act. You approve.",
    desc="See how Kai platform is being built: one account for fiat, crypto and stocks, AI agents that act on your behalf, and your approval on every sensitive move.",
    sections=[
        dict(t="hero", variant="main", eyebrow="How Kai Works", h1="How Kai platform works",
             sub="One account for your money. Agents that act for you. Every sensitive move waits for you.",
             buttons=[WAIT],
             visual=dict(photo="/assets/media/u-hold.jpg", eager=True, float=True, title="Getting started", chip="4 steps",
                         steps=[("Open", True), ("Fund", True), ("One balance", True), ("Approve", False)],
                         total=("€", "16825.40", "€16,825.40"), btn="Approve")),
        dict(t="steps", h2="Four steps. You stay in charge.", items=[
            ("Open your account", "Verify who you are, as a person or a business. The account is always yours."),
            ("Fund it", "Add euros or pounds by IBAN, or transfer in crypto and stablecoins."),
            ("Use it as one balance", "Hold, move and spend fiat, crypto, stablecoins and stocks from one balance, with the rate and fees shown before you confirm."),
            ("Let an agent prepare, you approve", "An agent is designed to prepare payments and moves for you. You review each one and approve."),
        ], ctas=[WAIT]),
        dict(t="cards", feat=True, h2="Everything your money needs. In one place.", items=FEATURES, line=FEATURES_LINE),
        dict(t="split", h2="One platform. Every agent. Your rules.",
             body="Kai platform is being built as the layer where AI agents act on behalf of people and businesses. An agent connects once to Kai platform, not to every provider, and acts only within the permissions you set.",
             visual=dict(kind="layers", layers=[("You", "The verified owner", False),
                                                ("Agents", "Kai's built-in agent, and later your own agent", False),
                                                ("Kai platform", "Permissions, approvals, execution", True),
                                                ("Financial services", "Fiat and payments, crypto, stocks, cards", False)])),
        dict(t="cards", dark=True, h2="Built in first. Your own agent later.", items=[
            ("agent", "Kai's built-in agent", "Designed to prepare payments and moves for you, and to work with other service agents, such as travel or bookings, while Kai platform keeps funds and approvals in one place."),
            ("link", "Your own agent, later", "Connect an external AI agent you already use through MCP (Model Context Protocol), a standard way for an agent to plug into a service with only the access it is given."),
        ], line=AGENT_LINE),
        dict(t="steps", h2="Humans retain control. Agents execute.",
             lead="Every agent works inside limits you set, and nothing sensitive happens without you.", items=[
            ("Verify", "You prove who you are and stay the account owner."),
            ("Connect", "You choose which agent can connect and what it can see."),
            ("Set limits", "Permissions decide what an agent can read, prepare and request."),
            ("Confirm", "Transfers, withdrawals and larger trades wait for your approval in Kai platform."),
            ("Review", "Every agent action and every approval is designed to be logged."),
        ]),
        dict(t="story", h2="“Pay this invoice. Keep my reserve intact.”",
             body="Here is how a business owner's request is designed to flow through Kai platform.",
             visual=dict(photo="/assets/media/05-business-m.jpg", title="Kai agent", chip="Waiting for you",
                         msgs=[("me", "Pay this invoice. Keep my reserve intact."),
                               ("agent", "Ready: €9,600 to the approved supplier, funded from euros. Your reserve stays as it is.")],
                         btn="Approve"),
             steps=[
            ("You set the goal", "Pay an approved supplier within budget."),
            ("The agent prepares", "It checks balances and proposes how to fund the payment without touching your reserve."),
            ("You confirm", "You review the amount, route and fees, and approve in Kai platform."),
            ("It goes out", "The payment is sent through Kai platform's payment providers."),
        ], line="A budget or permission never replaces your confirmation of a transfer."),
        dict(t="security", h2="Built secure from the first screen", items=[
            "Identity verification with document and liveness checks.",
            "Crypto designed for institutional-grade custody with MPC keys, so no single private key ever exists in full.",
            "Real-time transaction monitoring, with sanctions and wallet screening.",
            "Passkeys, PIN and authenticator app, with extra checks on sensitive actions.",
            "Agents see and do only what you allow, and every approved move is designed to run through a separate workflow after your approval.",
        ], links=[("How we keep your account secure", "/trust/")]),
        dict(t="faq", h2="Questions about how Kai works", items=[
            FAQ_AGENT, FAQ_HOW,
            ("Can I connect my own AI agent?", "Not at the start. Connecting an external AI agent you already use is planned for a later stage, through MCP (Model Context Protocol), a standard way for an agent to plug into a service with only the access it is given. You decide what it can see, prepare and request, every action is logged, and transfers, withdrawals and larger trades still wait for your confirmation in Kai platform."),
            FAQ_MOVE,
            ("Who owns my account?", "You do. The person or business that verifies with Kai platform is always the account owner. An agent only works on your behalf, with the access you give it, and Kai platform is designed so you can change or remove that access."),
            FAQ_ADVICE,
        ]),
        dict(t="final", **FINAL_ALL),
    ])

PAGES["H-03"] = dict(level=3,
    title="Kai platform pricing | See the cost before you move",
    desc="Silver, Gold and Platinum plans for Personal and Business. Kai platform is designed to show the rate and fees before you confirm, on every move.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Pricing", h1="See the cost before you move.",
             sub="Kai platform is designed to show the rate and fees on every payment, conversion and trade. Before you confirm.",
             buttons=[WAIT],
             # particles in place of the frame: a balance weighs what you send (€) against what arrives (£) plus
             # the fee (%), and settles level (assets/site/particles.js: "scale")
             shape="scale", burn=1),
        dict(t="cards", h2="Clear fees. In the open.", items=[
            ("shownfirst", "Shown first", "You see the rate and fees before you confirm."),
            ("everymove", "On every move", "Payments, conversions, card spend and trades show their cost in the flow."),
            ("approvepay", "What you approve is what you pay", "Kai platform is designed so the fee you see before you confirm is the fee you pay."),
        ], line="Silver, Gold and Platinum, for Personal and for Business."),
        dict(t="plans", h2="Personal plans, with every fee in view",
             lead="Plans for people who want one account for fiat, crypto, stablecoins and US-listed stocks.",
             plans=plans(["€0.00", "€47.88", "€95.88"], ["€59.88", "€47.88", "€11.88"])),
        dict(t="table", rows=FEES, line="Agent features are being built and are not part of the start. You can always use Kai platform yourself."),
        # own header layout (head_top): title and text start on the same line at the top, the text and button in the right column
        dict(t="plans", h2="Business plans, built for how companies move money",
             lead="Kai Business has its own account plan prices. Usage fees for transfers, cards, exchange, crypto and US stock trades follow the same Silver, Gold and Platinum rates as Personal.",
             plans=plans(["€95.88", "€179.88", "€359.88"], ["€179.88", "€119.88", "€0"]),
             line="Transfers, cards, currency exchange, crypto conversion and trading, and US stock trades use the same plan rates as Personal.",
             head_top=True, dark=True, vid=True, ctas=[("Business pricing", "/business/pricing/")]),
        dict(t="text", dark=True, h2="The fee is part of the move.",
             body="Before you confirm, Kai platform is designed to show what you send, the rate, the fees and what you get. If an agent prepares a move, you still see the same breakdown before you approve. Agent features are being built and are not part of the start."),
        dict(t="faq", h2="Questions about pricing", items=[
            ("What plans does Kai platform have?", "Three plans, for Personal and for Business: Silver, Gold and Platinum. Personal account plans are €0.00, €47.88 and €95.88 per year. Business account plans are €95.88, €179.88 and €359.88 per year. Usage fees, such as transfers, cards, exchange, crypto and US stock trades, follow the plan you choose. Kai platform is designed to show the rate and fees before you confirm, on every move."),
            ("When do I see what a move will cost?", "Kai platform is designed to show the rate and fees in the flow, before you confirm. That applies when you act yourself, and when an agent has prepared a move for you to approve."),
            ("Is pricing different for Personal and Business?", "Yes. Personal and Business have their own account plan prices. Usage fees follow the same Silver, Gold and Platinum rates. You can also read the Business pricing page."),
            ("Do agent features cost extra?", "There is an optional agent plan, priced per year. For Personal: Silver €59.88, Gold €47.88 and Platinum €11.88. For Business: Silver €179.88, Gold €119.88 and Platinum €0. Agent features are being built and are not part of the start. If a fee applies, Kai platform is designed to show it before you confirm. You can always use Kai platform yourself, with no agent at all."),
            ("How do I join Kai?", "Press \"Become the First\" to be the first to know when Kai platform opens in your country. Companies can join the business waitlist for Kai Business."),
        ]),
        dict(t="final", **FINAL_ALL),
    ])

WHY_ICONS = {"One balance": "onebalance", "Accounts with IBAN": "iban", "Cards": "fg_card", "Crypto and stablecoins": "fg_crypto",
             "Stocks": "stocks", "Built-in agent": "operator", "Permissions and limits": "control", "Approvals": "approvals",
             "Activity log": "activitylog", "Your own agent, later": "ownagent"}

PAGES["H-04"] = dict(level=3,
    title="Why Kai | One account. Built for agents. You approve.",
    desc="Why Kai platform: one account for fiat, crypto, stablecoins and stocks, where AI agents act on your behalf and you approve every sensitive move.",
    sections=[
        # pinned header like Business overview: the image fills the screen, then draws back into the frame on the right,
        # where the panel comes in, centred (still for now, video later)
        dict(t="hero", burn=1, variant="pin", no_ui=True, video="/assets/media/whykai-hero.mp4", eyebrow="Why Kai", h1="One account. Built for agents. You approve.",
             sub="We're building one place for your money, and the infrastructure through which AI agents act on your behalf. Humans retain control. Agents execute.",
             buttons=[WAIT],
             visual=dict(photo="/assets/media/04-ai-m.jpg", eager=True, title="One balance", chip="Waiting for you",
                         total=("€", "16825.40", "€16,825.40"),
                         msgs=[("agent", "Ready to pay the supplier invoice: €1,240.00 from your euros.")], btn="Approve")),
        dict(t="spread", h2="Your money lives in too many places",
             body="An account for bills, an exchange for crypto, a broker for stocks, a separate card. None of them talk to each other, and none were built for an AI agent to act safely on your behalf."),
        dict(t="cards", dark=True, eyebrow="Unified finance. Unlocked limits.", h2="Four reasons to choose Kai platform", items=[
            ("kyb", "Account experience", "Built around a verified person or business. The account is always yours."),
            ("convertmove", "Cross-asset execution", "Hold, move and spend fiat, crypto, stablecoins and stocks from one balance, with the rate and fees shown first."),
            ("operator", "Agent access", "Kai's built-in agent is designed to prepare payments and moves for you. Later, connect an agent you already use. An agent connects once to Kai platform, not to every provider."),
            ("control", "Control by design", "You set the permissions. Every sensitive move waits for your yes."),
        ], line=AGENT_LINE),
        # scroll-driven like Business accounts › Receive, hold and move: each step plays its action in the widget
        # (still in the frame for now, video later)
        dict(t="flow", clip="/assets/media/whykai-flow.mp4", h2="The workflow is the point.",
             lead="The point is not a longer list of tools. It is one flow: you set the goal, an agent prepares the move, you see the rate and fees, and you approve.",
             steps=[
                ("You set the goal", "Pay an approved supplier within budget."),
                ("The agent prepares", "It checks balances and proposes how to fund the payment."),
                ("You confirm", "You review the amount, route and fees, and approve in Kai platform."),
                ("It goes out", "The payment is sent through Kai platform's payment providers."),
             ], screens=[
                dict(title="Kai agent", chip="Your goal", msgs=[("me", "Pay Nordlicht GmbH's invoice. Keep it within this month's budget."),
                                                                 ("agent", "On it. Nordlicht GmbH is an approved supplier. Budget left: €5,000.00.")]),
                dict(title="Kai agent", chip="Preparing", rows=[
                    ("✓", "Invoice checked", "Nordlicht GmbH · INV-2041", "€4,280.00"),
                    ("✓", "Balances checked", "EUR €3,120.00 · USDC 6,400.00", ""),
                    ("→", "Proposed funding", "€3,120.00 from EUR, rest from USDC", "")]),
                dict(title="Review and approve", chip="Rate and fees first", conv=("You pay", "€3,120.00 + 1,262.40 USDC", "EUR + USDC", "They receive", "€4,280.00", "EUR"),
                     kv=[("Rate", "1 USDC = €0.9237"), ("Fee", "€4.90"), ("Within budget", "Yes")], btn="Approve", done="Approved ✓"),
                dict(title="Payment", chip="Sent", total=(4280.00, 4280.00, "€"), rows=[
                    ("✓", "Sent to Nordlicht GmbH", "SEPA · arrives today", ""),
                    ("✓", "Budget left this month", "", "€720.00")]),
             ], line="A budget or permission never replaces your confirmation of a transfer."),
        dict(t="cards", feat=True, h2="Everything your money needs. In one place.",
             # this page's own pictograms from Figma (new pictograms; Stocks from the older "pictograms" frame)
             items=[(WHY_ICONS[x[1]],) + ((x[1], "US-listed stocks in the same account, next to the rest of your money.") if x[1] == "Stocks" else x[1:]) for x in FEATURES],
             line=FEATURES_LINE),
        dict(t="compare", h2="Many tools. Or one platform.",
             lead="A typical setup splits your money and your workflow. Kai platform is being built to bring them together. This is a comparison against fragmented tools, not against named products.",
             cols=("Typical setup", "Kai platform"), rows=[
                ("Your money", "Split across separate apps.", "One account and one balance."),
                ("Moving value", "Hand-offs between tools.", "One flow, with the rate and fees shown first."),
                ("Agents", "No safe way to let an agent act.", "An agent prepares, and you approve."),
                ("Control", "Separate logins and limits.", "Permissions, approvals and a log in one place."),
             ], line="Kai platform is being built this way."),
        dict(t="text", shape="orbits", h2="Humans retain control. Agents execute.",
             body="Every agent works inside limits you set, and nothing sensitive happens without you. You can always use Kai platform yourself, with no agent at all.",
             links=[("See how Kai platform works", "/how-kai-works/")]),
        dict(t="faq", h2="Questions about why Kai", items=[
            ("What makes Kai platform different?", "Kai platform is being built as one account for fiat, crypto, stablecoins and stocks, and as the layer where AI agents act on your behalf. You stay the owner, you set the permissions, and you approve every sensitive move. The difference is the workflow, not a longer list of features. You can also use Kai platform with no agent at all. At the start, Kai's built-in agent answers questions about your money. Preparing and executing moves comes next."),
            FAQ_AGENT, FAQ_HOW, FAQ_MOVE, FAQ_ADVICE,
        ]),
        dict(t="final", **FINAL_ALL),
    ])

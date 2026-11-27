# Personal subpages P-03 to P-10 (docs v0.2). Website copy only.
from common import WAIT, FINAL, FEES_BAND

PAGES = {}

PAGES["P-03"] = dict(level=3,
    title="Cards | Virtual cards funded from your balances | Kai",
    desc="Prepaid virtual cards funded from your Kai balances, with Apple Pay and Google Pay, instant freeze and fees shown in the open.",
    sections=[
        dict(t="hero", variant="pin", fan=True, ui_center=True, eyebrow="Cards", h1="Cards funded from your Kai balances",
             sub="Prepaid virtual cards for online and in store, with Apple Pay and Google Pay.", buttons=[WAIT],
             visual=dict(photo="/assets/media/03-supplier-f.jpg", eager=True, title="Cards", chip="Virtual",
                         card=dict(last="4821", label="Virtual card"),
                         rows=[("€", "Funded from", "Euro balance", "€4,820.50")], acts=["Freeze", "Top up", "Add to wallet"])),
        dict(t="flist", h2="What you can do", rows=[
            ("card", "Several cards.", "Create more than one virtual card, for different needs."),
            ("move", "Funded your way.", "Top up a card from any of your Kai balances."),
            ("globe", "Pay anywhere.", "Add a card to Apple Pay or Google Pay."),
            ("account", "Physical card.", "A physical card on a major card network, for your Kai balances."),
            ("shield", "Instant control.", "Freeze and unfreeze a card in one tap."),
        ], line="Later, an agent is designed to spend only within limits you set, and to ask you first."),
        dict(FEES_BAND, dust=False),                             # no dust over this banner
        dict(t="promos", items=[("Crypto & Stablecoins", "/personal/crypto/", "/assets/media/cards-crypto.mp4"), ("Agents", "/personal/agents/", "/assets/media/cards-agents.mp4")]),   # stills for now, videos later
        dict(t="final", **FINAL),
    ])

PAGES["P-04"] = dict(level=3,
    title="Crypto & Stablecoins | Hold, send and trade | Kai",
    desc="Hold, send, convert and trade BTC, ETH, USDT, USDC and more in one Kai account, with institutional-grade custody and fees shown first.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Crypto & Stablecoins", h1="Crypto and stablecoins, next to your euros",
             sub="Hold, send, convert and trade in the same account, with the rate and fees shown first.", buttons=[WAIT],
             visual=dict(title="Wallet", chip="Rate shown first", rows=[
                 ("₿", "BTC", "Bitcoin", "€5,310.75"), ("Ξ", "ETH", "Ether", "€2,140.20"),
                 ("$", "USDT", "Stablecoin", "€1,450.00"), ("$", "USDC", "Stablecoin", "€1,454.55"),
                 ("€", "EUR", "Euro account", "€4,820.50")], acts=["Send", "Receive", "Convert"])),
        dict(t="flist", h2="What you can do", rows=[
            ("coins", "Hold.", "Major assets and stablecoins, such as BTC, ETH, USDT and USDC."),
            ("sendrecv", "Send and receive.", "Deposit to your own address. Withdraw to whitelisted addresses, with an address book."),
            ("exchange", "Convert.", "Crypto to crypto, or crypto to fiat, in a few taps."),
            ("chart", "Trade.", "Market and limit buys; market, limit and stop limit sells, with charts and order history."),
        ]),
        dict(t="text", dark=True, h2="Custody and security",
             body="Crypto is held on institutional-grade wallet infrastructure with MPC keys, so no single private key ever exists in full. Withdrawals get risk-based checks, and Travel Rule data goes with every transfer.",
             line="Trades are executed through external order book access."),
        dict(FEES_BAND, risk="Crypto-assets are volatile and can lose some or all of their value."),
        dict(t="promos", items=[("Invest & Trade", "/personal/invest/"), ("Move Money", "/personal/move-money/")]),
        dict(t="final", **FINAL),
    ])

PAGES["P-06"] = dict(level=3,
    title="Invest & Trade | US stocks in one account | Kai",
    desc="Buy and sell US-listed stocks from the same Kai account as your fiat and crypto, with market, limit and stop loss orders and clear fees.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Invest & Trade", h1="US stocks, next to the rest of your money",
             sub="Buy and sell US-listed stocks from the same account as your fiat and crypto.", buttons=[WAIT],
             visual=dict(photo="/assets/media/04-ai-m.jpg", eager=True, title="Portfolio", chip="One view",
                         total=("€", "12640.30", "€12,640.30"),
                         rows=[("↗", "US stocks", "4 holdings", "€6,370.00"), ("₿", "Crypto", "BTC, ETH", "€3,960.20"), ("€", "Cash", "EUR, GBP", "€2,310.10")])),
        dict(t="flist", h2="What you can do", rows=[
            ("globe", "Discover.", "Find US-listed stocks."),
            ("chart", "Order your way.", "Market, limit and stop loss orders."),
            ("pie", "Track it.", "Your portfolio and order history in one view."),
            ("move", "Fund it from any balance.", "Use fiat or crypto through Move Money."),
        ], line="You decide what to buy and sell. Kai platform and its agents do not give investment advice."),
        dict(FEES_BAND, risk="Investing in stocks puts your capital at risk. The value of investments can go down as well as up."),
        dict(t="promos", items=[("Move Money", "/personal/move-money/")]),
        dict(t="final", **FINAL),
    ])

PAGES["P-07"] = dict(level=3,
    title="Move Money | Any balance to any balance | Kai",
    desc="Move value between fiat, crypto, stocks and your card in one Kai account. See the rate, fees and result before you confirm.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Move Money", h1="Move value from any balance to any balance",
             sub="Fiat, crypto, stocks and your card. See the rate, fees and result before you confirm.", buttons=[WAIT],
             visual=dict(title="Move", chip="Rate shown first",
                         rows=[("Ξ", "From", "ETH balance", "0.42 ETH"), ("€", "To", "Euro account", "€1,312.42")],
                         kv=[("Rate", "1 ETH = €3,124.80"), ("Fee", "€3.28"), ("You get", "€1,309.14")], btn="Confirm")),
        dict(t="steps", h2="How it works", items=[
            ("Choose", "Pick where the value comes from and where it goes."),
            ("Check", "See the rate, the fees and exactly what you get."),
            ("Confirm", "Approve, and the move goes through."),
        ], line="Later, an agent is designed to prepare a move for you. You still review and confirm it."),
        FEES_BAND,
        dict(t="promos", items=[("See how agents work", "/personal/agents/")]),
        dict(t="final", **FINAL),
    ])

PAGES["P-08"] = dict(level=3,
    title="Agents | AI agents that act for you, with your approval",
    desc="Kai platform is being built so AI agents act on your behalf within the permissions you set. You approve every sensitive move.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Agents", h1="Agents act for you. You stay in control.",
             sub="Kai platform is being built as the financial infrastructure through which AI agents act on your behalf, within the permissions you set.",
             buttons=[WAIT],
             line="At the start, Kai's built-in agent answers questions about your money. Preparing and executing moves comes next. You can always use Kai platform yourself.",
             visual=dict(photo="/assets/media/04-ai-m.jpg", eager=True, title="Kai agent", chip="Waiting for you",
                         msgs=[("me", "Pay the electricity bill from my euros."),
                               ("agent", "Ready: €84.20 to the electricity supplier, from your Euro account. Fee €0.00.")],
                         btn="Approve")),
        dict(t="cards", h2="Two ways agents work", items=[
            ("agent", "Kai's built-in agent", "Answers questions about your money from the start. Next, it is designed to prepare payments and moves for your approval."),
            ("link", "Your own agent, later", "Connect an AI agent you already use through MCP (Model Context Protocol), with only the access you give it."),
        ]),
        dict(t="flist", h2="You set the rules", rows=[
            ("shield", "Permissions.", "Choose what each agent can see, prepare and request."),
            ("check", "Approvals.", "Transfers, withdrawals and larger trades wait for your confirmation."),
            ("doc", "Activity log.", "Every agent action and approval is designed to be logged."),
            ("move", "Off whenever you want.", "Switch AI features off and keep every core feature."),
        ]),
        dict(t="text", dark=True, h2="Private by design",
             body="Your personal data, IBANs and identity documents are never sent to the AI model. Agents do not give investment advice."),
        FEES_BAND,
        dict(t="promos", items=[("How Kai works", "/how-kai-works/")]),
        dict(t="final", **FINAL),
    ])

PAGES["P-09"] = dict(level=3,
    title="Kai for crypto natives | Make your crypto work",
    desc="Hold crypto, pay bills in euros and fund your card from one Kai balance, with institutional-grade custody and fees shown first.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Kai for crypto natives", h1="Make your crypto work in the fiat world",
             sub="Hold crypto, pay a bill in euros and top up your card, all from one balance.", buttons=[WAIT],
             visual=dict(photo="/assets/media/06-dev-f.jpg", eager=True, title="Pay a bill", chip="From ETH",
                         rows=[("Ξ", "Paid from", "ETH balance", "0.02695 ETH"), ("€", "Bill", "Electricity, in euros", "€84.20")],
                         kv=[("Rate", "1 ETH = €3,124.80")], btn="Confirm")),
        dict(t="flist", h2="Why it fits", rows=[
            ("move", "No more detours.", "Skip selling on an exchange, withdrawing and waiting."),
            ("pie", "One balance.", "Your crypto and your euros in the same account."),
            ("shield", "Secure custody.", "Institutional-grade custody, with whitelisted withdrawals."),
            ("chart", "Trade when you want.", "From the balance you already have."),
        ]),
        dict(t="next", label="Your path", h2="Your path", items=[("Crypto & Stablecoins", "/personal/crypto/"), ("Cards", "/personal/cards/"), ("Move Money", "/personal/move-money/")]),
        dict(t="final", **FINAL),
    ])

PAGES["P-10"] = dict(level=3,
    title="Kai for global professionals | One account, many currencies",
    desc="EUR and GBP IBANs, quick conversions and a card funded from any balance, in one Kai account. Fees shown before you confirm.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Kai for global professionals", h1="One account for a life across currencies",
             sub="Get paid in euros, pounds or stablecoins. Spend in the currency you need.", buttons=[WAIT],
             visual=dict(photo="/assets/media/01-hero-f.jpg", eager=True, title="Activity", chip="EUR · GBP",
                         rows=[("£", "Received", "From a client, in pounds", "£2,400.00"), ("€", "Spent", "Rent, in euros", "€1,450.00")],
                         kv=[("Exchange rate", "£1 = €1.1620")])),
        dict(t="flist", h2="Why it fits", rows=[
            ("account", "IBANs clients recognise.", "Your own EUR and GBP IBANs to start, more currencies to come."),
            ("exchange", "Quick conversions.", "See the rate and fees before you confirm."),
            ("card", "A card that keeps up.", "Top up from any balance, then pay with Apple Pay or Google Pay."),
            ("pie", "No idle buffers.", "Keep one balance instead of spare cash in several accounts."),
        ]),
        dict(t="next", label="Your path", h2="Your path", items=[("Accounts", "/personal/accounts/"), ("Cards", "/personal/cards/"), ("Move Money", "/personal/move-money/")]),
        dict(t="final", **FINAL),
    ])

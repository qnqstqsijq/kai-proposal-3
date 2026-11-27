# Resources R-01, R-03, R-04, R-05 and Trust & Security T-01 (docs v0.1). Website copy only.
from common import WAIT, FINAL

PAGES = {}

UI = dict(read_more="Read more", prev="Previous", next="Next", page="Page {n} of {total}", empty="New posts will appear here.")

PAGES["R-01"] = dict(level=4, template="hub",
    title="Resources | Articles, news and press | Kai",
    desc="Articles, news and press from Kai: AI agents, money across fiat, crypto and stocks, and company updates.",
    hero=dict(eyebrow="Resources", h1="Resources", sub="Articles, news and press from the Kai team."),
    ui=UI,
    after=[dict(t="band", dust=False, h2="Glossary", body="Plain definitions of the terms we use.", cta=("Glossary", "/resources/glossary/")),   # banner like Business overview › Business pricing
           dict(t="final", **FINAL)])

PAGES["R-03"] = dict(level=4, template="listing", type="News", per_page=9,
    title="News | Kai", desc="Company updates from Kai platform.",
    hero=dict(eyebrow="News", h1="News", sub="Updates from Kai."), ui=UI)

PAGES["R-04"] = dict(level=4, template="listing", type="Press", per_page=9,
    title="Press | Official announcements | Kai",
    desc="Official announcements from Kai platform, the company boilerplate and press contact.",
    hero=dict(eyebrow="Press", h1="Press", sub="Official announcements from Kai."), ui=UI,
    after=[dict(t="boiler", h2="About Kai",
                body="Kai is an AI-native financial platform for individuals and businesses. Kai is building the financial infrastructure through which AI agents act on behalf of people and businesses. Humans retain control. Agents execute. Kai platform is designed to bring fiat accounts, crypto, stocks and virtual cards into one account, with one balance to spend, trade and move, starting with EUR and GBP IBANs and institutional-grade custody for digital assets. Kai's built-in agent answers questions about money in plain language and is designed to prepare moves for the customer to approve. Kai platform is operated by Coin Bridge AG, trading as KAI, Baarerstrasse 25, 6300 Zug, Switzerland (CHE-110.571.003), a member of VQF (member no. 10127), a Swiss self-regulatory organisation (SRO) supervised by FINMA.",
                kicker="Humans retain control. Agents execute.",
                facts=[("Operator", "Coin Bridge AG, trading as KAI"), ("Headquarters", "Baarerstrasse 25, 6300 Zug, Switzerland"),
                       ("Supervision", "VQF member no. 10127, an SRO supervised by FINMA"), ("Company number", "CHE-110.571.003")],
                tbc=[("Press contact", "Press email TBC")], links=[("Kai facts", "/about/facts/")])])

PAGES["R-05"] = dict(level=4, template="glossary",
    title="Glossary | AI agents, MCP, IBAN, KYC and more | Kai",
    desc="Plain definitions of the terms used on Kai platform: AI agents, MCP, IBAN, stablecoins, KYC, KYB, order book, custody and more.",
    hero=dict(h1="Glossary", sub="Plain definitions of the terms we use."),
    terms=[
        ("AI agent", "Software that prepares and carries out tasks for a person or business, within the permissions they give it."),
        ("Approve to execute", "How Kai platform works with agents: an agent prepares an action, and you approve it before anything happens."),
        ("Built-in agent", "Kai's own agent. At the start it answers questions about your money; preparing moves for your approval comes next."),
        ("Bring your own agent", "Connecting an AI agent you already use to Kai platform through MCP, with only the permissions you give it. Planned."),
        ("CASP", "Crypto-asset service provider: the MiCA term for licensed crypto businesses."),
        ("Custody", "Safekeeping of digital assets on the customer's behalf."),
        ("Faster Payments, CHAPS, BACS", "Sterling transfers in the UK: Faster Payments is near-instant, CHAPS is same-day for high values, and BACS is batch, such as salaries and direct debits."),
        ("IBAN", "The international standard account number used to receive and send fiat transfers."),
        ("KYB", "Know Your Business: verification of a company, its ownership and the people behind it."),
        ("KYC", "Know Your Customer: verification of a person's identity."),
        ("MCP", "Model Context Protocol: an open standard that lets AI assistants connect to tools and services, such as Kai platform."),
        ("MiCA", "The EU's Markets in Crypto-Assets Regulation."),
        ("Move Money", "The Kai feature for moving value between any two Kai balances: fiat, crypto, stocks and card."),
        ("Order book", "The live list of buy and sell orders for an asset at different prices. Trades happen when a buy and a sell order match."),
        ("Sanctions and wallet screening", "Checking people, entities and crypto addresses against sanctions lists and risk data."),
        ("Scoped permissions", "The limits an owner sets on what an agent can see, prepare and request."),
        ("SEPA, SEPA Instant", "Euro transfers across Europe: standard, and instant around the clock."),
        ("SRO, VQF", "A self-regulatory organisation (SRO) supervises anti-money-laundering duties in Switzerland. VQF is the SRO that Kai's Swiss entity, Coin Bridge AG, belongs to."),
        ("Stablecoin", "A digital asset designed to track the value of a fiat currency, such as USDT or USDC."),
        ("Transaction monitoring", "Real-time checks on payments to detect fraud and financial crime."),
        ("Travel Rule", "The FATF requirement to share originator and beneficiary information with crypto transfers."),
        ("VASP", "Virtual asset service provider: the term used by FATF and several regulators."),
        ("Virtual IBAN", "An IBAN issued to you through Kai's fiat partner, used to receive and send money in your name."),
    ])

PAGES["T-01"] = dict(level=4, template="doc",
    title="Trust & Security | Security built in | Kai",
    desc="How Kai platform protects your account, data and crypto: strong sign-in, risk-based checks, encryption, private AI and institutional-grade custody.",
    hero=dict(eyebrow="Trust & Security", h1="Security built in from the first screen",
              sub="Protection for your account, your data and your crypto, with every sensitive move in your hands.", buttons=[WAIT]),
    docsecs=[
        ("your-account", "Your account", dict(ul=[
            ("Strong sign-in.", "Passkeys, a PIN code and an authenticator app."),
            ("Checks that match the risk.", "Sensitive actions, like sending money or adding a payee, need more checks as the risk rises."),
            ("Alerts on every sensitive action.", "An email when it starts, and another when it completes or fails."),
            ("Safe recovery.", "Recovering an account can include re-verifying your identity, with a cooling-off period for sensitive actions."),
        ])),
        ("your-data", "Your data", dict(ul=[
            ("Encrypted.", "Your data is encrypted in transit and at rest."),
            ("Private AI.", "Your personal data, IBANs and identity documents are never sent to the AI model."),
            ("AI is optional.", "Switch it off and keep every core feature."),
        ])),
        ("your-crypto", "Your crypto", dict(p=["Customer crypto is held with institutional-grade custody, under Coin Bridge AG, the Swiss company that operates Kai platform."])),
        ("checks", "Checks on every transfer", dict(ul=[
            ("Verified identity.", "Biometric and document verification with liveness checks."),
            ("Real-time monitoring.", "Transactions are monitored in real time to detect fraud and financial crime."),
            ("Screening.", "People and entities are screened against sanctions lists, and crypto addresses are screened too."),
        ])),
        ("agents", "Agents within your rules", dict(p=["At the start, Kai's built-in agent answers questions about your money. Preparing and executing moves comes next. Any agent sees and does only what you allow, sensitive moves wait for your approval, and every action is designed to be logged."],
                                                   cta=("How agents work", "/personal/agents/"))),
        ("operator", "Who operates Kai platform", dict(p=["Kai platform is operated by Coin Bridge AG, trading as KAI, Baarerstrasse 25, 6300 Zug, Switzerland (CHE-110.571.003), a member of VQF (member no. 10127), a Swiss self-regulatory organisation (SRO) supervised by FINMA."],
                                                       cta=("Compliance", "/trust/compliance/"))),
    ],
    final=FINAL)

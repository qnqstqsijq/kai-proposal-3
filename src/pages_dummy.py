# Placeholder (dummy) content for the pages that had no content doc yet: P-05, B-02, B-06 and the
# help and legal pages. Website copy only, written in the voice of the other pages; replace with the
# approved docs when they exist. Legal pages say so on the page.
from common import WAIT, SALES, FINAL, FINAL_BIZ, FEES_BAND, BIZ_PRICING_BAND

PAGES = {}
DRAFT = "Placeholder text for the website build. The approved document will replace it."

# P-05 Supported assets
PAGES["P-05"] = dict(level=3,
    title="Supported assets | Crypto and stablecoins on Kai platform",
    desc="The crypto-assets and stablecoins Kai platform is designed to support at the start, and the networks you can use for each.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Supported assets", h1="The assets you can hold on Kai platform",
             sub="Major crypto-assets and stablecoins, held next to your euros and pounds, with the network shown before you send.",
             buttons=[WAIT],
             visual=dict(title="Supported assets", chip="At the start", rows=[
                 ("₿", "BTC", "Bitcoin network", "Hold · Send · Trade"), ("Ξ", "ETH", "Ethereum", "Hold · Send · Trade"),
                 ("$", "USDC", "Ethereum, Solana", "Hold · Send · Convert"), ("$", "USDT", "Ethereum, Tron", "Hold · Send · Convert"),
                 ("◎", "SOL", "Solana", "Hold · Send · Trade")])),
        dict(t="flist", h2="What each asset supports", rows=[
            ("coins", "Hold.", "Every supported asset sits in the same account as your fiat, with one balance across all of them."),
            ("sendrecv", "Send and receive.", "Deposit to your own address and withdraw to whitelisted addresses, on the networks listed for each asset."),
            ("exchange", "Convert.", "Swap between supported assets, or into euros and pounds, with the rate and fees shown first."),
            ("chart", "Trade.", "Market and limit orders for the assets that have an order book."),
        ]),
        dict(t="text", h2="Check the network before you send.",
             body="Each asset lists the networks Kai platform supports for it. Sending on a network that is not listed can mean the funds cannot be recovered, so Kai platform is designed to show the network on every deposit and withdrawal screen.",
             line="More assets are added over time. The list in the app is always the current one."),
        dict(FEES_BAND, risk="Crypto-assets are volatile and can lose some or all of their value."),
        dict(t="promos", items=[("Crypto & Stablecoins", "/personal/crypto/"), ("Move Money", "/personal/move-money/")]),
        dict(t="final", **FINAL),
    ])

# B-02 Solutions by business type
PAGES["B-02"] = dict(level=3,
    title="Kai Business solutions | Built for how your company works",
    desc="How Kai Business fits startups, online sellers, agencies and crypto-native companies: one account for fiat and crypto, with approvals built in.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Solutions", h1="One account, shaped to how your business works",
             sub="Startups, online sellers, agencies and crypto-native companies all move money differently. Kai Business is designed to fit each of them.",
             buttons=[WAIT, SALES],
             visual=dict(title="Your business", chip="One account",
                         rows=[("€", "Operating", "EUR IBAN", "€84,200.00"), ("£", "UK clients", "GBP account", "£12,480.00"),
                               ("$", "Treasury", "USDC", "$40,000.00")],
                         kv=[("Approvals", "2 of 3 directors"), ("Team cards", "12 active")])),
        dict(t="cards", h2="Who Kai Business is for.", items=[
            ("account", "Startups", "Hold your raise in euros, pounds or stablecoins, pay your team and see your runway in one place."),
            ("move", "Online sellers", "Receive payouts in several currencies and pay suppliers from the same balance."),
            ("doc", "Agencies and studios", "Invoice clients abroad, pay freelancers and keep every payment approved by the right person."),
            ("shield", "Crypto-native companies", "Move between crypto and fiat in one account, with Travel Rule data on every transfer."),
        ], line="Not sure which fits? Tell us how your company moves money.",
           ctas=[("Talk to sales", "/business/contact/")]),
        dict(t="text", dark=True, h2="Humans retain control. Agents execute.",
             body="Whatever your business, sensitive moves wait for the people you choose. Agents can prepare payments within the rules you set; approving them stays with your team."),
        BIZ_PRICING_BAND,
        dict(t="faq", h2="Questions about Kai Business solutions", items=[
            ("Can a business of any size open an account?", "Kai Business is designed for companies of any size that pass KYB. Some business types may need more checks before the account opens."),
            ("Can we hold crypto as a company?", "Yes. Kai Business is designed to hold major crypto-assets and stablecoins next to your fiat balances, with institutional-grade custody."),
            ("Who approves payments?", "You choose. Set approval rules by amount, by payee or by type of payment, and Kai platform is designed to ask the right people before money moves."),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

# B-06 Treasury and liquidity
PAGES["B-06"] = dict(level=3,
    title="Treasury and liquidity | Kai Business",
    desc="See your company's cash across currencies and crypto, move between them with the rate shown first, and keep approvals on every treasury move.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Treasury and liquidity", h1="Your company cash, across every currency, in one view",
             sub="See fiat and crypto balances together, move between them with the rate shown first, and keep every treasury move approved.",
             buttons=[WAIT, SALES],
             visual=dict(title="Treasury", chip="Live balances",
                         rows=[("€", "EUR", "Operating", "€218,400.00"), ("£", "GBP", "Payroll", "£46,900.00"),
                               ("$", "USDC", "Reserve", "$150,000.00"), ("₿", "BTC", "Held", "€61,250.00")],
                         kv=[("Total", "€486,780.00"), ("Pending approvals", "1")])),
        dict(t="flist", h2="What treasury looks like on Kai Business", rows=[
            ("coins", "One view.", "Every balance, fiat and crypto, with a single total in your reporting currency."),
            ("exchange", "Move between currencies.", "Convert between euros, pounds, stablecoins and crypto, with the rate and fees shown before you confirm."),
            ("chart", "Plan ahead.", "See what is scheduled to go out, so you know what you have to work with."),
            ("shield", "Approvals on every move.", "Treasury moves follow the same approval rules as payments."),
        ]),
        dict(t="text", h2="Liquidity when you need it.",
             body="Kai Business is designed to let you move between fiat and stablecoins in a few taps, so money held as a reserve can become money to pay suppliers the same day.",
             line="Crypto-assets are volatile and can lose some or all of their value."),
        BIZ_PRICING_BAND,
        dict(t="faq", h2="Questions about treasury", items=[
            ("Can we earn yield on balances?", "Not at the start. Kai Business is designed to hold and move your money; any yield product would be announced separately."),
            ("Can an agent move treasury funds?", "An agent can prepare a move within the rules you set. Moving the money still needs approval from the people you choose."),
        ]),
        dict(t="final", **FINAL_BIZ),
    ])

# L-01 Help / FAQ
PAGES["L-01"] = dict(level=4,
    title="Help and FAQ | Kai",
    desc="Answers to common questions about Kai platform: your account, cards, crypto, agents, fees and security.",
    sections=[
        dict(t="hero", variant="text", eyebrow="Help", h1="How can we help?",
             sub="Answers to the questions people ask most. If yours is not here, contact us.", buttons=[("Contact us", "/contact/")]),
        dict(t="faq", h2="Your account", items=[
            ("Who can open a Kai account?", "Kai platform is opening by country. Join the waitlist and we will let you know when you can open an account where you live."),
            ("How long does verification take?", "Most people finish identity verification in a few minutes. Some checks can take longer, and we will tell you if we need anything else."),
            ("Can I have euro and pound accounts?", "Yes. Kai platform is designed to give you your own EUR and GBP IBANs in the same account as your crypto and stocks."),
        ]),
        dict(t="faq", h2="Money, cards and crypto", items=[
            ("What does it cost to send money?", "It depends on your plan and the way you send. Kai platform is designed to show the rate and fees before you confirm, every time."),
            ("Which crypto-assets are supported?", "Major crypto-assets and stablecoins, such as BTC, ETH, USDC and USDT. The current list is on the Supported assets page."),
            ("Can I spend crypto with my card?", "Your card can be funded from any balance. When you pay, Kai platform converts what is needed, with the rate shown first."),
        ]),
        dict(t="faq", h2="Agents and security", items=[
            ("Can an agent move my money without me?", "No. Sensitive moves wait for your approval. Agents act within the rules you set."),
            ("How is my account protected?", "Strong sign-in with passkeys, a PIN and an authenticator app, checks that match the risk, and alerts on every sensitive action."),
        ]),
        dict(t="final", **FINAL),
    ])

LEGAL_FINAL = None

def legal(code, url_title, title, desc, h1, sub, secs):
    PAGES[code] = dict(level=4, template="doc", title=title, desc=desc,
                       hero=dict(eyebrow=url_title, h1=h1, sub=sub + " " + DRAFT), docsecs=secs)

# L-02 Privacy Policy
legal("L-02", "Privacy Policy", "Privacy Policy | Kai", "How Coin Bridge AG, operating Kai platform, collects, uses and protects your personal data.",
      "Privacy Policy", "Last updated: 1 December 2026.", [
    ("who-we-are", "Who we are", dict(p=[
        "Kai platform is operated by Coin Bridge AG, Baarerstrasse 25, 6300 Zug, Switzerland. Coin Bridge AG is the controller of the personal data described in this policy."])),
    ("what-we-collect", "What we collect", dict(ul=[
        ("Identity data.", "Name, date of birth, nationality and identity documents, to verify who you are."),
        ("Contact data.", "Email address, phone number and address."),
        ("Financial data.", "Balances, transactions, wallet addresses and payment details."),
        ("Device data.", "Device type, IP address and app usage, to keep your account secure."),
    ])),
    ("why-we-use-it", "Why we use it", dict(p=[
        "We use your data to open and run your account, to meet our legal obligations, including anti-money laundering checks, to keep your account secure, and, with your consent, to tell you about new features."])),
    ("sharing", "Who we share it with", dict(p=[
        "We share data only with service providers that help us run Kai platform, such as identity verification, custody and card partners, and with authorities when the law requires it. We do not sell your personal data."])),
    ("ai", "Data and AI", dict(p=[
        "Your personal files, identity documents and full card numbers are never sent to an AI model. Agents see only what they need to prepare a move you have asked for."])),
    ("your-rights", "Your rights", dict(p=[
        "You can ask to see, correct or delete your data, or object to how we use it, by writing to privacy@kai.xyz. Some data must be kept for a period set by law."])),
])

# L-03 Terms of Use
legal("L-03", "Terms of Use", "Terms of Use | Kai", "The terms that apply when you use the Kai platform website and app.",
      "Terms of Use", "Last updated: 1 December 2026.", [
    ("agreement", "Agreement", dict(p=[
        "These terms apply when you use the Kai platform website and app, operated by Coin Bridge AG, Zug, Switzerland. By using Kai platform you agree to them."])),
    ("eligibility", "Who can use Kai platform", dict(p=[
        "You must be at least 18, live in a country where Kai platform is available, and pass our identity checks."])),
    ("your-account", "Your account", dict(ul=[
        ("Keep it safe.", "You are responsible for your sign-in details and devices."),
        ("Keep it accurate.", "Tell us when your details change."),
        ("Use it lawfully.", "Kai platform may not be used for illegal activity or to avoid sanctions."),
    ])),
    ("agents", "Agents", dict(p=[
        "Agents act within the rules you set. Sensitive moves wait for your approval, and you remain responsible for the moves you approve."])),
    ("risks", "Risks", dict(p=[
        "Crypto-assets and stocks can lose some or all of their value. Kai platform does not give investment advice."])),
    ("changes", "Changes and contact", dict(p=[
        "We may update these terms and will tell you before important changes take effect. Questions: legal@kai.xyz."])),
])

# L-04 Cookie Policy
legal("L-04", "Cookie Policy", "Cookie Policy | Kai", "Which cookies the Kai platform website uses, and how to change your choices.",
      "Cookie Policy", "Last updated: 1 December 2026.", [
    ("what-cookies-are", "What cookies are", dict(p=[
        "Cookies are small files stored on your device when you visit a website. They help the site work and remember your choices."])),
    ("cookies-we-use", "Cookies we use", dict(ul=[
        ("Necessary.", "Keep the site secure and remember your cookie choices. These are always on."),
        ("Analytics.", "Help us understand how the site is used, so we can improve it. Only with your consent."),
        ("Marketing.", "Measure our campaigns. Only with your consent."),
    ])),
    ("your-choices", "Your choices", dict(p=[
        "You can change your choices at any time from Cookie settings in the footer, or by clearing cookies in your browser."])),
    ("contact", "Contact", dict(p=["Questions about cookies: privacy@kai.xyz."])),
])

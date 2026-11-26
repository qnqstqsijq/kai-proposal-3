# Content shared by several pages.
WAIT = ("Become the First", "waitlist")
SALES = ("Talk to sales", "/business/contact/")

FINAL = dict(title="Be first when Kai platform opens",
             body="Become the First to know when Kai platform opens in your country.", ctas=[WAIT])
FINAL_BIZ = dict(title="Be first when Kai platform opens",
                 body="Become the First to know when Kai platform opens in your country, for your business.", ctas=[WAIT, SALES])
FINAL_ALL = dict(title="Be first when Kai platform opens",
                 body="Become the First to know when Kai platform opens in your country, for you and for your business.",
                 ctas=[WAIT, ("Become the First · Business", "waitlist")])

# the Business pricing banner: same strip as the Personal one, named like its page in the menu
BIZ_PRICING_BAND = dict(t="band", h2="Business pricing", cta=("Business pricing", "/business/pricing/"))
FEES_BAND = dict(t="band", h2="Pricing", cta=("Pricing", "/pricing/"))

# Usage fees, from H-03 Pricing and B-09 Business pricing (same rates for Personal and Business).
FEES = [
    ("grp", "Transfers"),
    ("Deposit, SWIFT", ["€30.00", "€25.00", "€20.00"]),
    ("Deposit, SEPA, Faster Payments, CHAPS or BACS", ["€1.00", "€0.00", "€0.00"]),
    ("Internal transfers and crypto deposits", ["€0.00", "€0.00", "€0.00"]),
    ("Withdrawal, SWIFT", ["€30.00", "€25.00", "€20.00"]),
    ("Withdrawal, SEPA, Faster Payments, CHAPS or BACS", ["€5.00", "€1.00", "€0.00"]),
    ("Crypto withdrawal to an external wallet", ["€3.00", "€1.50", "€1.00"], "Network fee always applies"),
    ("grp", "Cards"),
    ("Card top-up of the account", ["3.00%", "2.50%", "2.00%"]),
    ("Card, foreign-currency payments in store and online", ["2.00%", "1.50%", "1.00%"], "Domestic card payments: €0.00 on every plan"),
    ("Card, ATM fixed fee", ["€1.50", "€1.00", "€0.00"]),
    ("Card, ATM percentage fee", ["3.00%", "2.00%", "1.00%"]),
    ("Card, monthly ATM limit", ["€200", "€500", "€1,000"], "ATM fee applies above it"),
    ("Card issuance, virtual / plastic", ["€1.00 / €5.00", "€0.00 / €3.00", "€0.00 / €1.00"]),
    ("grp", "Exchange and trading"),
    ("Currency exchange, fiat to fiat", ["1.00%", "0.50%", "0.25%"]),
    ("Crypto conversion", ["1.00%", "0.75%", "0.50%"]),
    ("Crypto trading, maker / taker", ["0.50% / 0.50%", "0.30% / 0.35%", "0.20% / 0.25%"]),
    ("US stock trades, per trade", ["€2.00", "€1.00", "€0.50"]),
    ("grp", "Support"),
    ("Customer support", ["In-app chat", "Priority chat and email", "Dedicated account manager"]),
]

def plans(account, agent, hi=None):   # no plan is promoted over another
    names = ["Silver", "Gold", "Platinum"]
    fx, conv, stock, sup = ["1.00%", "0.50%", "0.25%"], ["1.00%", "0.75%", "0.50%"], ["€2.00", "€1.00", "€0.50"], ["In-app chat", "Priority chat and email", "Dedicated account manager"]
    return [dict(name=names[i], price=account[i], items=[("Optional agent plan", f"{agent[i]} per year"), ("Currency exchange", fx[i]),
                 ("Crypto conversion", conv[i]), ("US stock trades", stock[i]), ("Support", sup[i])], hi=(i == hi)) for i in range(3)]

FEATURES = [
    ("pie", "One balance", "Fiat, crypto, stablecoins and stocks in one view."),
    ("account", "Accounts with IBAN", "Your own IBAN for euros and pounds."),
    ("card", "Cards", "Designed to let you spend straight from your balance."),
    ("coins", "Crypto and stablecoins", "Hold, send and convert, with the rate and fees shown first."),
    ("chart", "Stocks", "Designed to be part of the first release, next to the rest of your money."),
    ("agent", "Built-in agent", "Designed to prepare payments and moves for you."),
    ("shield", "Permissions and limits", "You decide what each agent can see and do."),
    ("check", "Approvals", "Every sensitive move waits for your yes."),
    ("doc", "Activity log", "Designed to record every agent action and approval."),
    ("link", "Your own agent, later", "Connect an agent you already use through MCP."),
]
FEATURES_LINE = "At the start, the built-in agent answers questions about your money. Preparing and executing moves comes next."
AGENT_LINE = "At the start, Kai's built-in agent answers questions about your money. Preparing and executing moves comes next. You can always use Kai platform yourself."
BIZ_AGENT_LINE = "At the start, Kai's built-in agent answers questions about your business money. Preparing and executing moves comes next. You can always use Kai Business yourself."

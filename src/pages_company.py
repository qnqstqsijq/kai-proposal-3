# Company pages C-01, C-02, C-04 to C-07 (docs v0.1). Website copy only. C-03 profiles are built from people.py.
from common import WAIT, FINAL, FINAL_ALL

PAGES = {}

PAGES["C-01"] = dict(level=3,
    title="About Kai | Financial services built for the AI era",
    desc="Kai is building the financial infrastructure through which AI agents act for people and businesses. Operated by Coin Bridge AG, Zug, Switzerland.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="About Kai", h1="The financial infrastructure through which AI agents act for people and businesses",
             sub="Financial services built for the AI era. Humans retain control. Agents execute.", buttons=[WAIT],
             visual=dict(photo="/assets/media/u-hold.jpg", eager=True, title="Kai platform", chip="Waiting for you",
                         total=("€", "16825.40", "€16,825.40"),
                         msgs=[("agent", "Prepared: move €500 from crypto to euros for Friday's rent.")], btn="Approve")),
        dict(t="text", h2="Money is split. AI is starting to act.",
             body="Today an account for bills, a wallet and an exchange for crypto and a broker for stocks all sit in different apps that do not work together. At the same time, AI is moving from advice to action, and none of those apps were built for an agent to act safely on someone's behalf."),
        dict(t="cards", h2="One account. One balance. Agents within your rules.", items=[
            ("account", "One account", "Fiat, crypto, stablecoins, stocks and cards in one place."),
            ("pie", "One balance", "Hold crypto and pay a bill in euros, with the rate and fees shown before you confirm."),
            ("agent", "Agents within your rules", "An agent can read, prepare and request. Sensitive moves wait for your confirmation."),
            ("check", "Optional by design", "You can always use Kai platform yourself, with no agent at all."),
        ], links=[("How Kai works", "/how-kai-works/")]),
        dict(t="checks", h2="Humans retain control. Agents execute.", items=[
            "The account always belongs to the person or business that owns it.",
            "Agents act only within the permissions the owner sets, and every agent action is logged.",
            "Compliance and security are built in from the first screen.",
            "Rates and fees are shown before you confirm.",
        ]),
        dict(t="people", h2="The team behind Kai platform", lead="A senior team from financial services, digital assets, product and compliance.",
             people=["gadi-davidyan", "youval-fabri", "lina-fabri", "david-dadon", "omri-hanover", "galateia-charalampous"],
             links=[("Meet the team", "/about/team/")]),
        dict(t="text", dark=True, h2="A Swiss company, member of VQF",
             body="Coin Bridge AG, trading as KAI, is a company incorporated under the laws of Switzerland in the canton of Zug (CHE-110.571.003). Coin Bridge AG is a member of VQF (VQF member no. 10127), a Swiss self-regulatory organization (SRO) supervised by FINMA.",
             links=[("See Kai facts", "/about/facts/")]),
        dict(t="next", label="Explore", h2="For people and businesses whose money lives in more than one world",
             lead="Entrepreneurs, digital nomads and globally minded investors who earn, hold and spend across currencies and asset types, and businesses that hold both fiat and crypto.",
             items=[("Explore Kai Personal", "/personal/"), ("Explore Kai Business", "/business/")]),
        dict(t="final", title="Be first when Kai platform opens",
             body="Become the First to know when Kai platform opens in your country, for you and for your business.", ctas=[WAIT]),
    ])

PAGES["C-02"] = dict(level=3,
    title="Team | The people building Kai platform",
    desc="Meet the leadership team behind Kai platform: senior people from financial services, digital assets, product and compliance.",
    sections=[
        dict(t="hero", variant="text", eyebrow="Team", h1="The people building Kai platform",
             sub="A senior team from financial services, digital assets, product and compliance, building the financial infrastructure through which AI agents act for people and businesses."),
        dict(t="people", h2="Leadership",
             people=["gadi-davidyan", "youval-fabri", "lina-fabri", "david-dadon", "omri-hanover", "galateia-charalampous"]),
        dict(t="people", h2="Compliance, legal and security", people=["tiffany-ben", "shiran-kleiderman", "kassem-lahham"]),
        dict(t="final", title="Build it with us", body="We're looking for people who want to shape financial services for the AI era.",
             ctas=[("See careers", "/careers/")]),
    ])

PAGES["C-04"] = dict(level=3,
    title="Kai facts | Company, regulation and official links",
    desc="Official facts about Kai: Kai platform, operated by Coin Bridge AG, Zug (CHE-110.571.003), VQF member no. 10127, and its official links.",
    sections=[
        dict(t="hero", variant="text", eyebrow="Kai facts", h1="Kai facts",
             sub="The official facts about Kai, in one place. Please use these when you write about us."),
        dict(t="facts", h2="At a glance", facts=[
            ("Name", "Kai"), ("Product", "Kai platform"),
            ("What Kai is", "Financial services built for the AI era. Kai platform brings fiat, crypto, stablecoins, stocks and cards into one account, and is being built as the financial infrastructure through which AI agents act on behalf of people and businesses."),
            ("Principle", "Humans retain control. Agents execute. Using an agent is optional."),
            ("Who it is for", "Individuals and businesses whose money lives in more than one world."),
            ("Status", "Kai platform is in build. Become the First to know when it opens in your country."),
        ]),
        dict(t="facts", h2="Company", facts=[
            ("Operator", "Coin Bridge AG, trading as KAI"), ("Incorporated in", "Switzerland, canton of Zug"),
            ("Business identification number", "CHE-110.571.003"), ("Registered office", "Baarerstrasse 25, 6300 Zug, Switzerland"),
            ("Headquarters", "Zug, Switzerland"),
            ("Regulatory status", "Member of VQF (VQF member no. 10127), a Swiss self-regulatory organization (SRO) supervised by FINMA."),
            ("Founded", "[TBC]"), ("Leadership", "Gadi Davidyan and Youval Fabri, Co-CEOs"),
        ], links=[("Meet the team", "/about/team/")]),
        dict(t="facts", h2="Lines we use", facts=[
            ("Primary line", "Financial services built for the AI era."), ("Supporting line", "Humans retain control. Agents execute."),
            ("Secondary line", "Unified finance. Unlocked limits."), ("Call to action", "Become the First"),
        ]),
        dict(t="checks", h2="How to write about Kai", items=[
            "Write Kai, and Kai platform for the product.",
            "Kai is a financial platform, operated by Coin Bridge AG.",
            "Agents act on behalf of people and businesses, within the permissions they set.",
        ]),
        dict(t="facts", h2="Official links", lead="These are Kai's official channels.", facts=[
            ("Website", "https://kai.xyz"), ("LinkedIn", "https://www.linkedin.com/company/kaiplatform"),
            ("X", "https://x.com/KaiPlatform"), ("YouTube", "https://www.youtube.com/@Kai_Platform"),
            ("Instagram", "https://www.instagram.com/kai_platform/"),
        ]),
        dict(t="facts", h2="Media", facts=[("Press contact", "[Press email TBC]"), ("Brand assets", "[Logo and brand kit download TBC]")],
             links=[("Contact us", "/contact/")]),
    ])

STORIES = [
    dict(tag="Crypto native", img="/assets/p9-daniel.jpg", name="Daniel Weiss", role="Head of Research", org="Lumen Labs",
         quote="“I hold crypto and pay my bills in euros from the same account. I see the rate and fees before every move, so I know exactly what I get.”"),
    dict(tag="Global professional", img="/assets/p9-sofia.jpg", name="Sofia Marin", role="Co-founder and CEO", org="Fjordline Commerce",
         quote="“I get paid in pounds and spend in euros. With EUR and GBP IBANs in one Kai account and a virtual card on top, I finally see all my money in one view.”"),
    dict(tag="Business founder", img="/assets/p9-jonas.jpg", name="Jonas Keller", role="Product Designer", org="Northbeam Studio",
         quote="“Our online shop gets paid in euros and stablecoins. With a Kai business account we keep both in one place and see the full picture at a glance.”"),
    # sample stories without a photo yet: the card shows the person's initials in the frame
    dict(tag="Freelancer", img=None, name="Amara Okafor", role="Independent UX consultant", org="Studio Okafor",
         quote="“Clients pay me from three countries. Kai shows every invoice landing in one balance, and I move it to euros when the rate suits me.”"),
    dict(tag="Business founder", img=None, name="Lukas Brandt", role="Founder and CFO", org="Halden Outdoor",
         quote="“Two directors approve every supplier payment. Our agent prepares the batch on Monday and nothing moves until we both say yes.”"),
    dict(tag="Crypto native", img=None, name="Mei Tanaka", role="Protocol engineer", org="Arclight Network",
         quote="“I keep stablecoins for work and euros for life. Converting between them takes seconds, and I always see the fee before I confirm.”"),
    dict(tag="Global professional", img=None, name="Rafael Costa", role="Remote product lead", org="Northwind Labs",
         quote="“Salary in pounds, rent in euros, savings in stocks. For the first time it all sits in one account with one view of what I own.”"),
]

PAGES["C-05"] = dict(level=3,
    title="Customer stories | Kai platform",
    desc="How people and businesses use Kai platform, in their own words: one account for fiat, crypto, stablecoins, stocks and cards, with you in control.",
    sections=[
        dict(t="hero", variant="text", eyebrow="Customers", h1="Customer stories", sub="How people and businesses use Kai platform, in their own words."),
        dict(t="stories", stories=STORIES, line="Every story on this page is shared with the customer's written consent."),
        dict(t="final", **FINAL_ALL),
    ])

PAGES["C-06"] = dict(level=3,
    title="Contact Kai | Support, business, partnerships and press",
    desc="Contact Kai: support, business, partnerships, press and data requests. Coin Bridge AG, trading as KAI, Baarerstrasse 25, 6300 Zug, Switzerland.",
    sections=[
        dict(t="hero", variant="text", eyebrow="Contact", h1="Contact Kai",
             sub="Questions about Kai platform, a partnership or a story? Choose a topic and we'll route your message to the right team."),
        dict(t="cards", h2="How can we help?", items=[
            ("agent", "Customer support", "Questions about Kai platform or the waitlist."),
            ("account", "Business", "Kai platform for your company."),
            ("link", "Partnerships", "Work with Kai."),
            ("doc", "Press", "Media requests and interviews."),
            ("shield", "Privacy and data requests", "Access, correction or deletion of your personal data."),
            ("check", "Complaints", "Tell us when something went wrong."),
        ]),
        dict(t="form", kind="contact", idp="ct-", h2="Send us a message"),
        dict(t="facts", h2="Company details", facts=[
            ("Company", "Coin Bridge AG, trading as KAI"), ("Registered office", "Baarerstrasse 25, 6300 Zug, Switzerland"),
            ("Business identification number", "CHE-110.571.003"),
            ("Regulatory status", "Member of VQF (VQF member no. 10127), a Swiss self-regulatory organization (SRO) supervised by FINMA."),
            ("Phone", "[Phone TBC]"),
        ]),
        dict(t="text", h2="Follow Kai", body="Follow Kai platform on LinkedIn, X and YouTube.",
             links=[("LinkedIn", "https://www.linkedin.com/company/kaiplatform"), ("X", "https://x.com/KaiPlatform"), ("YouTube", "https://www.youtube.com/@Kai_Platform")]),
        dict(t="final", title="Not ready to write?", body="Become the First to know when Kai platform opens in your country.", ctas=[WAIT]),
    ])

PAGES["C-07"] = dict(level=3,
    title="Careers at Kai | Build financial services for the AI era",
    desc="Join Kai and build the financial infrastructure through which AI agents act for people and businesses. See open roles and how to apply.",
    sections=[
        dict(t="hero", variant="sub", eyebrow="Careers", h1="Build the financial infrastructure for the AI era",
             sub="Join the team building Kai platform, where AI agents act on behalf of people and businesses and humans stay in control.",
             buttons=[("See open roles", "#open-roles")],
             visual=dict(photo="/assets/media/07-join-mf.jpg", eager=True, title="Open roles", chip="1 role",
                         rows=[("C", "Chief Financial Officer (CFO)", "Full-time, permanent", "")])),
        dict(t="flist", h2="Why work at Kai", rows=[
            ("check", "A central role.", "Real ownership: what you build shapes how Kai platform works."),
            ("shield", "Compliance by design.", "Help build controls into the product, not on top of it."),
            ("agent", "Direct access.", "Work directly with the founders and the leadership team."),
            ("globe", "International team.", "English is our working language."),
            ("pie", "A competitive package.", "Based on your experience."),
        ]),
        dict(t="roles", id="open-roles", h2="Open roles", roles=[
            ("Chief Financial Officer (CFO)", "Kai · Location TBC · Full-time, permanent · Reports to the Co-CEOs",
             "Own finance across the group: reporting, planning, treasury, tax and the financial side of regulation."),
        ]),
        dict(t="text", h2="How to apply",
             body="Send your CV and a short note about your experience to the careers email (TBC). All applications are treated confidentially. We are an equal opportunity employer."),
        dict(t="final", title="Follow us for new roles",
             ctas=[("Follow Kai on LinkedIn", "https://www.linkedin.com/company/kaiplatform"), ("Meet the team", "/about/team/")]),
    ])

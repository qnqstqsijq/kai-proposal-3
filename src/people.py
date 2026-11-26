# Team from C-02 Team and authors (doc v0.1). Bios only where C-03 gives an approved example.
def P(slug, name, title, area, line, group, bio=None, focus=None):
    return dict(slug=slug, name=name, title=title, area=area, line=line, group=group, bio=bio, focus=focus)

PEOPLE = [
 P("gadi-davidyan", "Gadi Davidyan", "Co-CEO", "Company leadership",
   "Former CIO at a major financial institution, building core infrastructure and digital platforms for financial services.", "lead",
   bio="Gadi Davidyan is Co-CEO of Kai. He is a former CIO at a major financial institution, with years spent building core infrastructure and digital platforms for financial services, and serves as an advisory board member to fintech and cybersecurity start-ups."),
 P("youval-fabri", "Youval Fabri", "Co-CEO", "Company leadership",
   "Entrepreneur and executive adviser in digital assets and global finance, focused on cross-border regulatory engagement.", "lead"),
 P("lina-fabri", "Lina Fabri", "CPO", "Leads product",
   "A global product executive who has built AI-driven payment platforms.", "lead"),
 P("david-dadon", "David Dadon", "Head of Financial Products and Partnerships", "Leads fiat products and financial partnerships",
   "Leads fiat products and financial partnerships.", "lead"),
 P("omri-hanover", "Omri Hanover", "Head of Trading", "Leads crypto and stocks trading",
   "Leads crypto and stocks trading.", "lead"),
 P("galateia-charalampous", "Galateia Charalampous", "Head of Operations", "Leads day-to-day operations, customer support and partner processes",
   "Leads day-to-day operations, customer support and partner processes.", "lead"),
 P("tiffany-ben", "Tiffany Ben", "Legal and Compliance Manager", "Leads internal legal and compliance support",
   "Leads internal legal and compliance support.", "compliance"),
 P("shiran-kleiderman", "Shiran Kleiderman", "CISO", "Leads information security",
   "Leads information security: security strategy, controls and incident response.", "compliance"),
 P("kassem-lahham", "Kassem Lahham", "Swiss MLRO", "Leads anti-money laundering for Coin Bridge AG in Switzerland",
   "Leads anti-money laundering for Coin Bridge AG in Switzerland.", "compliance"),
]
PEOPLE_BY = {p["slug"]: p for p in PEOPLE}

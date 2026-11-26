# The site structure from S-06 HTML sitemap. "label" is the short footer and menu name (H-01 footer spec);
# "name" is the S-06 page name. missing=True means there is no content doc yet: shown as "(no-content)", not linked.

def P(code, name, url, label=None, missing=False):
    return dict(code=code, name=name, url=url, label=label or name, missing=missing)

GROUPS = [
 ("Main pages", [
   P("H-01", "Home", "/"),
   P("H-02", "How Kai Works", "/how-kai-works/"),
   P("H-03", "Pricing", "/pricing/"),
   P("H-04", "Why Kai", "/why-kai/"),
 ]),
 ("Personal", [
   P("P-01", "Personal overview", "/personal/"),
   P("P-02", "Accounts", "/personal/accounts/"),
   P("P-03", "Cards", "/personal/cards/"),
   P("P-04", "Crypto & Stablecoins", "/personal/crypto/"),
   P("P-05", "Supported assets", "/personal/crypto/supported-assets/"),
   P("P-06", "Invest & Trade", "/personal/invest/"),
   P("P-07", "Move Money", "/personal/move-money/"),
   P("P-08", "Agents", "/personal/agents/"),
   P("P-09", "Kai for crypto natives", "/personal/crypto-natives/"),
   P("P-10", "Kai for global professionals", "/personal/global-professionals/"),
 ]),
 ("Business", [
   P("B-01", "Kai Business overview", "/business/", label="Business overview"),
   P("B-02", "Solutions by business type", "/business/solutions/", label="Solutions"),
   P("B-03", "Business accounts", "/business/accounts/", label="Accounts"),
   P("B-04", "Payments, payroll and bill pay", "/business/payments/"),
   P("B-05", "Team cards", "/business/cards/"),
   P("B-06", "Treasury and liquidity", "/business/treasury/", label="Treasury"),
   P("B-07", "API and integrations", "/business/api/"),
   P("B-08", "Onboarding and verification", "/business/onboarding/"),
   P("B-09", "Business pricing", "/business/pricing/"),
   P("B-10", "Contact sales", "/business/contact/"),
 ]),
 ("Company", [
   P("C-01", "About Kai", "/about/"),
   P("C-02", "Team and authors", "/about/team/"),
   P("C-04", "Kai facts", "/about/facts/"),
   P("C-05", "Customer testimonials", "/customers/"),
   P("C-06", "Contact", "/contact/"),
   P("C-07", "Careers", "/careers/"),
 ]),
 ("Resources", [
   P("R-01", "Resources hub", "/resources/"),
   P("R-02", "Blog listing", "/resources/blog/", label="Blog"),
   P("R-03", "News listing", "/resources/news/", label="News"),
   P("R-04", "Press listing", "/resources/press/", label="Press"),
   P("R-05", "Glossary", "/resources/glossary/"),
 ]),
 ("Trust, help and legal", [
   P("T-01", "Trust & Security", "/trust/"),
   P("T-02", "Compliance", "/trust/compliance/"),
   P("L-01", "Help / FAQ", "/help/"),
   P("L-02", "Privacy Policy", "/privacy-policy/"),
   P("L-03", "Terms of Use", "/terms-of-use/"),
   P("L-04", "Cookie Policy", "/cookie-policy/"),
 ]),
 ("Utility", [
   P("S-06", "HTML sitemap", "/sitemap/"),
 ]),
]

BY_CODE = {p["code"]: p for _, ps in GROUPS for p in ps if p["code"]}
BY_URL = {p["url"]: p for _, ps in GROUPS for p in ps}

# Header: Personal and Business open dropdowns; the rest are the main pages.
NAV_DROPDOWNS = [
 ("personal", "Personal", [c for c in ["P-01", "P-02", "P-03", "P-04", "P-06", "P-07", "P-08", "P-09", "P-10"]]),
 ("business", "Business", ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06", "B-07", "B-08", "B-09", "B-10"]),
]
NAV_LINKS = ["H-02", "H-03", "H-04"]

SOCIAL = [("X", "https://x.com/KaiPlatform"), ("LinkedIn", "https://www.linkedin.com/company/kaiplatform"),
          ("YouTube", "https://www.youtube.com/@Kai_Platform")]

# Line icons in the homepage's style: 60 x 60, 2.5 stroke, rounded joins, currentColor.
_P = {
 "account": '<rect x="6" y="14" width="48" height="34" rx="7"/><path d="M6 24.5h48"/><path d="M37 37h9"/>',
 "card": '<rect x="5" y="13" width="50" height="34" rx="6.5"/><path d="M5 23.5h50"/><path d="M13 38h11"/>',
 "coins": '<ellipse cx="30" cy="17" rx="18" ry="7"/><path d="M12 17v13c0 3.9 8.1 7 18 7s18-3.1 18-7V17"/><path d="M12 30v13c0 3.9 8.1 7 18 7s18-3.1 18-7V30"/>',
 "chart": '<path d="M7 49h46"/><path d="M11 39l12-12 9 8 16-17"/><path d="M38 18h10v10"/>',
 "move": '<path d="M9 21h38"/><path d="M40 13l8 8-8 8"/><path d="M51 39H13"/><path d="M20 31l-8 8 8 8"/>',
 "agent": '<rect x="8" y="9" width="44" height="33" rx="9"/><path d="M20 42v9l9-9"/><path d="M30 16.5c.9 4.4 2.9 6.4 7.3 7.3-4.4.9-6.4 2.9-7.3 7.3-.9-4.4-2.9-6.4-7.3-7.3 4.4-.9 6.4-2.9 7.3-7.3z"/>',
 "globe": '<circle cx="30" cy="30" r="22"/><path d="M8 30h44"/><path d="M30 8c6 6 9 13.5 9 22s-3 16-9 22c-6-6-9-13.5-9-22s3-16 9-22z"/>',
 "sendrecv": '<path d="M20 50V11"/><path d="M12 19l8-8 8 8"/><path d="M40 10v39"/><path d="M48 41l-8 8-8-8"/>',
 "exchange": '<circle cx="21" cy="24" r="13"/><circle cx="39" cy="36" r="13"/>',
 "link": '<path d="M27 33a9 9 0 0 0 12.7 0l7.6-7.6a9 9 0 0 0-12.7-12.7l-3.2 3.2"/><path d="M33 27a9 9 0 0 0-12.7 0l-7.6 7.6a9 9 0 0 0 12.7 12.7l3.2-3.2"/>',
 "pie": '<path d="M27 9.5A21 21 0 1 0 50.5 33H27z"/><path d="M34 6v20h20A20 20 0 0 0 34 6z"/>',
 "shield": '<path d="M30 6l20 7v14c0 13-8.6 22.6-20 27C18.6 49.6 10 40 10 27V13z"/><path d="M21.5 29.5l6 6 11-12"/>',
 "doc": '<path d="M15 6h21l11 11v33a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z"/><path d="M35 6v12h12"/><path d="M19 31h22M19 40h15"/>',
 "check": '<path d="M14 31l10 10 22-23"/>',
}
_SMALL = {
 "arrow": '<path d="M9.35 11.42l2.89-2.89a1.2 1.2 0 0 0 0-1.7L9.35 3.94" fill="none" stroke="currentColor" stroke-width="1.17"/><path d="M12.65 7.3H1.1" stroke="currentColor" stroke-width="1.17"/>',
 "chev": '<path d="M4.06 5.8L5.73 7.47C6.41 8.15 7.51 8.15 8.19 7.47L9.86 5.8" stroke="currentColor" stroke-width="1.16"/>',
 "x": '<path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
}

def icon(name, cls=""):
    return (f'<svg class="{cls}" viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{_P[name]}</svg>')

def small(name, cls="ar"):
    return f'<svg class="{cls}" viewBox="0 0 14 14" fill="none" aria-hidden="true">{_SMALL[name]}</svg>'

SEARCH = ('<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.25" stroke="currentColor" stroke-width="1.5"/>'
          '<path d="M13.6 13.6L17.5 17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>')

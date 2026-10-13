"""Deriving one person's record from another.

Graduating a member is mostly a copy, but a few fields have to be worked out
rather than carried across. That logic lives here so it can be tested on its
own and so the router stays a description of the request.
"""

from __future__ import annotations

import re

# A roster term, as the branch writes it: "2025-26", "2024-2025", or just
# "2025". The separator varies because the value is typed by hand.
# The dashes are spelled as escapes so an en or em dash pasted in from a
# document is matched without putting a look-alike character in the source.
_TERM = re.compile(r"(?P<start>\d{4})(?:\s*[-/\u2013\u2014]\s*(?P<end>\d{2,4}))?")

# Outside this range the value is a typo or a different kind of number, and
# storing it would put a nonsense year on the public alumni page. It matches
# the bound the alumni schemas already enforce.
_EARLIEST_YEAR = 1990
_LATEST_YEAR = 2100


def graduation_year_from_term(term: str | None) -> int | None:
    """The year a member serving in `term` would be expected to graduate.

    A roster term names an academic session, and the session's *end* is the
    year that belongs on an alumni card: someone on the 2025-26 roster
    graduates in 2026. Returns None when the term is missing or is not a
    year at all, so the caller can leave the field empty rather than publish
    a guess.
    """
    if not term:
        return None

    match = _TERM.search(term)
    if match is None:
        return None

    start = int(match.group("start"))
    end = match.group("end")
    if end is None:
        year = start
    elif len(end) == 2:
        # "2025-26" abbreviates the end year, so it borrows the start's
        # century - and borrows the next one when the session crosses it,
        # as "1999-00" does.
        year = start - start % 100 + int(end)
        if year < start:
            year += 100
    else:
        year = int(end)

    if not _EARLIEST_YEAR <= year <= _LATEST_YEAR:
        return None
    return year

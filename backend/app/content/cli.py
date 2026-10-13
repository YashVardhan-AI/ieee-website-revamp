"""`ieee-content` - the scriptable way to update the site.

    just content-import      load content/ into the database
    just dbsync              write the database back out to content/
    just dbsync members      ... or just one section of it
    just content-check       show what an import would change
    just content-validate    check the files without touching the database

Both directions take section names, so dashboard edits can be pulled back a
piece at a time instead of rewriting the whole tree. Run with --help for the
full set of flags and the list of sections.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from pydantic import ValidationError

from app.content.store import ContentError
from app.content.sync import SECTION_FILES, SECTION_ORDER, ContentSync, SyncReport
from app.core.config import settings
from app.db.session import SessionLocal


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ieee-content",
        description="Import and export the version-controlled site content.",
    )
    parser.add_argument(
        "--content-dir",
        type=Path,
        default=settings.content_dir,
        help="Content directory (default: %(default)s)",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    importer = subparsers.add_parser("import", help="Load content/ into the database")
    _add_sections_argument(importer, "load")
    importer.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing anything",
    )
    importer.add_argument(
        "--prune",
        action="store_true",
        help=(
            "Also delete database rows that no longer appear in content/. "
            "Off by default so an import never removes content added in the dashboard."
        ),
    )

    exporter = subparsers.add_parser("export", help="Write the database out to content/")
    _add_sections_argument(exporter, "write")

    subparsers.add_parser("validate", help="Validate content/ without using the database")
    return parser


def _add_sections_argument(parser: argparse.ArgumentParser, verb: str) -> None:
    """The optional list of sections both directions accept."""
    listing = ", ".join(f"{name} ({SECTION_FILES[name]})" for name in SECTION_ORDER)
    parser.add_argument(
        "sections",
        nargs="*",
        metavar="SECTION",
        help=f"Sections to {verb}; all of them when none are given. One of: {listing}.",
    )


def _print_report(report: SyncReport, *, title: str) -> None:
    print(title)
    lines = report.lines()
    if lines:
        print("\n".join(lines))
    else:
        print("  nothing to do")
    for warning in report.warnings:
        print(f"  warning: {warning}", file=sys.stderr)


def _validate_only(content_dir: Path) -> int:
    """Parse and validate every content file, touching no database.

    Runs in a transaction that is always rolled back, which lets the same
    validation code path be reused without a schema or connection dependency
    on the importer's behaviour.
    """
    with SessionLocal() as db:
        sync = ContentSync(db, content_dir)
        try:
            report = sync.import_all(dry_run=True)
        except (ContentError, ValidationError) as exc:
            print(f"Content is not valid:\n  {exc}", file=sys.stderr)
            return 1
    _print_report(report, title=f"content/ is valid ({content_dir})")
    return 0


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    content_dir: Path = args.content_dir

    if args.command == "validate":
        return _validate_only(content_dir)

    with SessionLocal() as db:
        sync = ContentSync(db, content_dir)
        try:
            scope = " ".join(args.sections) if args.sections else "everything"
            if args.command == "import":
                report = sync.import_sections(args.sections, prune=args.prune, dry_run=args.dry_run)
                mode = "would change" if args.dry_run else "imported"
                _print_report(report, title=f"content/ {mode} ({scope}):")
                if args.dry_run and report.total_changes == 0:
                    print("Database already matches content/.")
            else:
                report = sync.export_sections(args.sections)
                _print_report(report, title=f"wrote database to {content_dir} ({scope}):")
        except ContentError as exc:
            print(f"Content error:\n  {exc}", file=sys.stderr)
            return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

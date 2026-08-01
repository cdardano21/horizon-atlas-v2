import pathlib
import tempfile
import unittest

from openpyxl import Workbook

from scripts.import_workbook_destinations import read_workbook_entries


class ImportWorkbookDestinationsTests(unittest.TestCase):
    def test_reads_master_sheet_and_skips_blank_and_incomplete_rows(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            workbook_path = pathlib.Path(tmpdir) / "sample-master-workbook.xlsx"
            workbook = Workbook()
            worksheet = workbook.active
            worksheet.title = "Master Destinations"
            worksheet.append([
                "slug",
                "city",
                "country",
                "description",
                "overview",
                "climate",
                "lifestyle",
                "transportation",
                "tags",
            ])
            worksheet.append([
                "alpha-country",
                "Alpha",
                "Country",
                "Alpha description",
                "Alpha overview",
                "Alpha climate",
                "Alpha lifestyle",
                "Alpha transportation",
                "alpha; beta",
            ])
            worksheet.append([])
            worksheet.append([
                "beta-country",
                "Beta",
                "Country",
                "",
                "Beta overview",
                "Beta climate",
                "Beta lifestyle",
                "Beta transportation",
                "beta",
            ])
            worksheet.append([
                "gamma-country",
                "Gamma",
                "Country",
                "Gamma description",
                "Gamma overview",
                "Gamma climate",
                "Gamma lifestyle",
                "Gamma transportation",
                "gamma",
            ])
            workbook.save(workbook_path)

            entries, duplicates, missing_by_slug = read_workbook_entries(workbook_path)

            self.assertEqual([entry["slug"] for entry in entries], ["alpha-country", "gamma-country"])
            self.assertEqual(entries[0]["city"], "Alpha")
            self.assertEqual(entries[0]["tags"], ["alpha", "beta"])
            self.assertEqual(duplicates, [])
            self.assertEqual(missing_by_slug, {"beta-country": ["description"]})


if __name__ == "__main__":
    unittest.main()

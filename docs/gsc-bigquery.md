# Search Console data (BigQuery bulk export)

Agent-facing note. How to read txquince.com Google Search Console data without Dang exporting anything.

## Where the data is

- GSC property: `sc-domain:txquince.com`
- GCP project: `txquince-seo` · dataset: `searchconsole` · location: `US`
- Read it with the BigQuery MCP connector (`list_table_ids`, `execute_sql_readonly`), signed in as Dang's Google account.
- Export turned on: **2026-11-09**. The first day of data is **2026-11-08**; nothing older was backfilled. For anything older, use the GSC UI or ask Dang for a Sheets export.
- Tables confirmed on 2026-11-11. A day lands about two days after it ends (Nov 9 arrived on Nov 11).

## Tables (Google's documented names; confirm with `list_table_ids` first)

- `searchdata_site_impression`: property-level totals by date, query, country, device.
- `searchdata_url_impression`: per-URL rows (use this for page-level questions).
- `ExportLog`: one row per daily export; check it for gaps.
- `temp_*` tables: Google's setup probe. Ignore them.

Date column is `data_date`. Position is stored zero-based, under a different name in each table: `sum_top_position` in `searchdata_site_impression`, `sum_position` in `searchdata_url_impression`. Average position = `SUM(<that column>) / SUM(impressions) + 1`. Anonymized queries have `is_anonymized_query = true` and an empty query; on a site this small they are most of the impressions (783 of 967 in the first two days), so the named queries are a sample, not the total. The URL table counts a `#section` link as its own URL: strip the fragment with `REGEXP_REPLACE(url, r'#.*$', '')` before grouping by page.

## Example query

```sql
SELECT data_date, SUM(clicks) clicks, SUM(impressions) impressions,
       SAFE_DIVIDE(SUM(sum_top_position), SUM(impressions)) + 1 AS avg_position
FROM `txquince-seo.searchconsole.searchdata_site_impression`
WHERE data_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
GROUP BY data_date ORDER BY data_date;
```

## Gotchas

- Access: `search-console-data-export@system.gserviceaccount.com` has BigQuery Job User + Data Editor; Dang's account has Owner + MCP Tool User. The BigQuery MCP server needs no separate enable step (`gcloud beta services mcp enable` no longer exists).
- The dataset had no default table expiration on 2026-11-09, so tables should not auto-expire. Re-check with `get_dataset_info` if old data goes missing.
- Do not change the project, dataset or location. That means turning off the export and deleting the dataset. Ask Dang first.
- Ahrefs GSC tools need a higher plan, and the Supermetrics trial ended 2026-11-03. Don't use either for GSC.

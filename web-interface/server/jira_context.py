import logging
import os
import re
from typing import Any

import httpx


ISSUE_KEY_PATTERN = re.compile(r"(?<![A-Z0-9])([A-Z][A-Z0-9]{1,9}-\d+)(?![A-Z0-9])")
MAX_DESCRIPTION_LENGTH = 6000


def extract_jira_issue_key(value: str | None) -> str | None:
    if not value:
        return None
    match = ISSUE_KEY_PATTERN.search(value)
    return match.group(1) if match else None


def _description_to_text(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        return "".join(_description_to_text(item) for item in value)
    if not isinstance(value, dict):
        return ""

    if value.get("type") == "text":
        return str(value.get("text", ""))

    content = _description_to_text(value.get("content", []))
    if value.get("type") in {"paragraph", "heading", "listItem", "codeBlock"}:
        return f"{content}\n"
    return content


async def fetch_jira_issue(issue_key: str | None) -> dict[str, Any]:
    issue_key = extract_jira_issue_key(issue_key)
    if not issue_key:
        return {"status": "not_detected", "key": None}

    jira_url = os.getenv("JIRA_URL", "").rstrip("/")
    api_token = (
        os.getenv("JIRA_API_TOKEN")
        or os.getenv("JIRA_API_KEY")
        or os.getenv("JIRA_TOKEN")
    )
    username = (
        os.getenv("JIRA_USERNAME")
        or os.getenv("JIRA_USER")
        or os.getenv("JIRA_EMAIL")
    )
    if not jira_url or not api_token:
        return {
            "status": "not_configured",
            "key": issue_key,
            "message": "Set JIRA_URL and a Jira API token on the API server.",
        }

    headers = {"Accept": "application/json"}
    auth = (username, api_token) if username else None
    if not username:
        headers["Authorization"] = f"Bearer {api_token}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{jira_url}/rest/api/2/issue/{issue_key}",
                params={"fields": "summary,description"},
                headers=headers,
                auth=auth,
            )
        if response.status_code == 404:
            return {"status": "not_found", "key": issue_key}
        response.raise_for_status()
        fields = response.json().get("fields", {})
        description = _description_to_text(fields.get("description")).strip()
        return {
            "status": "found",
            "key": issue_key,
            "title": fields.get("summary", ""),
            "description": description[:MAX_DESCRIPTION_LENGTH],
            "url": f"{jira_url}/browse/{issue_key}",
        }
    except httpx.HTTPStatusError as error:
        if error.response.status_code in {401, 403}:
            message = "Jira rejected the credentials or access to this issue."
        else:
            message = "Jira could not return this issue. Check the API server logs."
        logging.warning("Jira request failed for %s with status %s", issue_key, error.response.status_code)
        return {"status": "unavailable", "key": issue_key, "message": message}
    except (httpx.HTTPError, ValueError, TypeError) as error:
        logging.warning("Jira request failed for %s: %s", issue_key, error)
        return {
            "status": "unavailable",
            "key": issue_key,
            "message": "Jira is unavailable. Check the API server connection and logs.",
        }
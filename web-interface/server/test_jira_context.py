import asyncio
import os
import unittest
from unittest.mock import patch

from jira_context import extract_jira_issue_key, fetch_jira_issue


class JiraContextTests(unittest.TestCase):
    def test_extracts_issue_key_from_branch_or_explicit_value(self):
        self.assertEqual(extract_jira_issue_key("feature/PROJ-123-add-login"), "PROJ-123")
        self.assertEqual(extract_jira_issue_key("APP-42"), "APP-42")
        self.assertIsNone(extract_jira_issue_key("feature/proj-123-add-login"))

    def test_reports_missing_server_configuration_without_requesting_jira(self):
        with patch.dict(os.environ, {}, clear=True):
            result = asyncio.run(fetch_jira_issue("PROJ-123"))

        self.assertEqual(result["status"], "not_configured")
        self.assertEqual(result["key"], "PROJ-123")

    def test_fetches_issue_with_basic_auth_and_flattens_description(self):
        calls = []

        class FakeResponse:
            status_code = 200

            def raise_for_status(self):
                return None

            def json(self):
                return {
                    "fields": {
                        "summary": "Add account recovery",
                        "description": {
                            "type": "doc",
                            "content": [
                                {
                                    "type": "paragraph",
                                    "content": [{"type": "text", "text": "Users need recovery."}],
                                }
                            ],
                        },
                    }
                }

        class FakeClient:
            def __init__(self, **kwargs):
                pass

            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                return None

            async def get(self, url, **kwargs):
                calls.append((url, kwargs))
                return FakeResponse()

        env = {
            "JIRA_URL": "https://example.atlassian.net/",
            "JIRA_USER": "meghana@example.com",
            "JIRA_TOKEN": "test-token",
        }
        with patch.dict(os.environ, env, clear=True), patch("jira_context.httpx.AsyncClient", FakeClient):
            result = asyncio.run(fetch_jira_issue("PROJ-123"))

        self.assertEqual(result["status"], "found")
        self.assertEqual(result["title"], "Add account recovery")
        self.assertEqual(result["description"], "Users need recovery.")
        self.assertEqual(result["url"], "https://example.atlassian.net/browse/PROJ-123")
        self.assertEqual(calls[0][1]["auth"], ("meghana@example.com", "test-token"))


if __name__ == "__main__":
    unittest.main()
#!/usr/bin/env python3
"""
Career Assistant Bootstrap Script
Run this at the start of every session to restore data from Google Drive.
Usage: called by the skill automatically via bash_tool.
"""
# This script is referenced by SKILL.md bootstrap procedure.
# The actual bootstrap is executed via Google Drive MCP tools + bash_tool in sequence.
# This file documents the procedure for reference.

# File IDs (do not change):
FILES = {
    "master-profile.md":                              "12UenBSC9N63omnYprX0TW5vHwasF_llG",
    "job-preference.md":                              "1aWjV7AHCyTNMif8FBBCxmIVWZnhR6uja",
    "linkedin-profile.md":                            "1MoXI42Zxpxf4M9EWq60BNw95Uuu1zRcn",
    "resume-templates/humayun-akbar-technical-project-manager.html": "14akZd3OLZEmEvU7eRhE-K8T6W6Bxtao5",
    "resume-templates/humayun-akbar-ai-automation-engineer.html":    "1xvKe0KNpTBYKp4yvTU-AXyGw_8t5uXjl",
}

# Bootstrap steps:
# 1. mkdir -p /mnt/project/data/resume-templates /mnt/project/output
# 2. For each file: Google Drive:download_file_content(file_id) → base64 decode → write to /mnt/project/data/[filename]
# 3. Verify: ls /mnt/project/data/ — confirm all 3 .md files and 2 .html templates present

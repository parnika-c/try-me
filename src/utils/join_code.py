#!/usr/bin/env python3
import random
import re
import string
import sys

ALLOWED = string.ascii_letters + string.digits + "-"
PATTERN = re.compile(r'^[A-Za-z0-9\-]{7}$')

def generate_join_code(n: int = 7) -> str:
    return "".join(random.choices(ALLOWED, k=n))

def is_valid(code: str) -> bool:
    return bool(PATTERN.fullmatch(code or ""))

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    for _ in range(count):
        print(generate_join_code())
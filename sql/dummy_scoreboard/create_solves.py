import random
from datetime import datetime, timedelta

users = [f"00000000-0000-0000-0000-0000000000{i:02d}" for i in range(1, 29)]
challenges = [f"10000000-0000-0000-0000-0000000000{i:02d}" for i in range(1, 21)]

start_id = 96
total_solves = 50

# def random_timestamp():
#     now = datetime.now()
#     delta_days = random.randint(0, 4)
#     random_time = timedelta(
#         hours=random.randint(0, 23),
#         minutes=random.randint(0, 59),
#         seconds=random.randint(0, 59)
#     )
#     return (now - timedelta(days=delta_days) + random_time).strftime("%Y-%m-%d %H:%M:%S")

def random_timestamp():
    now = datetime.now()
    past = now - timedelta(days=4)
    random_seconds = random.randint(0, int((now - past).total_seconds()))
    ts = past + timedelta(seconds=random_seconds)
    return ts.strftime("%Y-%m-%d %H:%M:%S")

used_pairs = set()
rows = []
counter = 0

while len(rows) < total_solves:
    user_id = random.choice(users)
    challenge_id = random.choice(challenges)
    pair = (user_id, challenge_id)

    if pair in used_pairs:
        continue  # skip duplikat

    used_pairs.add(pair)
    num = start_id + counter
    solve_id = f"20000000-0000-0000-0000-{num:012d}"
    created_at = random_timestamp()
    rows.append((solve_id, user_id, challenge_id, created_at))
    counter += 1

with open("dummy_solves.sql", "w") as f:
    f.write("DELETE FROM public.solves WHERE id::text LIKE '20000000-%';\n\nINSERT INTO public.solves (id, user_id, challenge_id, created_at) VALUES\n")
    for i, (sid, uid, cid, ts) in enumerate(rows):
        line = f"('{sid}', '{uid}', '{cid}', '{ts}')"
        if i < len(rows) - 1:
            line += ",\n"
        else:
            line += "ON CONFLICT (user_id, challenge_id) DO NOTHING;\n"
        f.write(line)

print("✅ dummy_solves.sql siap tanpa duplikat (user_id, challenge_id).")

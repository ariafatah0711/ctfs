import random
import uuid
import hashlib

# Konfigurasi
total_users = 1000
total_challenges = 10
max_solves_per_user = 5

users_sql = []
challenges_sql = []
flags_sql = []
solves_sql = []

user_ids = []
challenge_ids = []

# Generate Users
for i in range(1, total_users + 1):
    uid = str(uuid.uuid4())
    user_ids.append(uid)
    username = f"user{i}"
    users_sql.append(
        f"INSERT INTO users (id, username) VALUES ('{uid}', '{username}');"
    )

# Generate Challenges & Flags
for i in range(1, total_challenges + 1):
    cid = str(uuid.uuid4())
    challenge_ids.append(cid)
    title = f"Challenge {i}"
    description = f"Deskripsi challenge {i}"
    category = random.choice(["Web", "Crypto", "Pwn", "Forensic", "Misc"])
    points = i * 100
    difficulty = random.choice(["Easy", "Medium", "Hard"])
    flag = f"FLAG{{dummy_flag_{i}}}"
    flag_hash = hashlib.sha256(flag.encode()).hexdigest()

    challenges_sql.append(
        f"INSERT INTO challenges (id, title, description, category, points, difficulty) "
        f"VALUES ('{cid}', '{title}', '{description}', '{category}', {points}, '{difficulty}');"
    )
    flags_sql.append(
        f"INSERT INTO challenge_flags (challenge_id, flag, flag_hash) "
        f"VALUES ('{cid}', '{flag}', '{flag_hash}');"
    )

# Generate Solves
for uid in user_ids:
    solved = random.sample(challenge_ids, random.randint(1, max_solves_per_user))
    for cid in solved:
        solves_sql.append(
            f"INSERT INTO solves (user_id, challenge_id) VALUES ('{uid}', '{cid}');"
        )

# Gabung ke file
with open("ctf_dummy_data.sql", "w") as f:
    f.write("-- Dummy Users\n")
    f.write("\n".join(users_sql))
    f.write("\n\n-- Dummy Challenges\n")
    f.write("\n".join(challenges_sql))
    f.write("\n\n-- Dummy Flags\n")
    f.write("\n".join(flags_sql))
    f.write("\n\n-- Dummy Solves\n")
    f.write("\n".join(solves_sql))

print("✅ File ctf_dummy_data.sql berhasil dibuat")

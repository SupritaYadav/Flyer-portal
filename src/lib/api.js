// Simulated async backend. Persists to localStorage so it keeps working offline.
const KEY = 'ffp-members';
const LATENCY = import.meta.env.MODE === 'test' ? 0 : 700;
const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY));

export const SEED_MEMBERS = [
  { id: 'seed-1', name: 'Aarav Mehta', email: 'aarav@example.com', miles: 61250 },
  { id: 'seed-2', name: 'Ishita Rao', email: 'ishita@example.com', miles: 27400 },
  { id: 'seed-3', name: 'Kabir Nair', email: 'kabir@example.com', miles: 12800 },
  { id: 'seed-4', name: 'Meera Joshi', email: 'meera@example.com', miles: 3150 },
];

export async function loadMembers() {
  await wait();
  const raw = localStorage.getItem(KEY);
  if (!raw) return SEED_MEMBERS;
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_MEMBERS;
  }
}

export async function saveMembers(members) {
  await wait();
  localStorage.setItem(KEY, JSON.stringify(members));
}

import json

with open('feature_list.json') as f:
    d = json.load(f)

f = [t for t in d if not t.get('passes')]
print(f'{len(d)-len(f)}/{len(d)} passing')
for t in f[:15]:
    print(f'  TODO: {t["description"]}')


path = 'backend/models/cms.py'
with open(path, 'r') as f:
    content = f.read()
new_content = content.replace('PRIMARY_KEY', 'primary_key')
with open(path, 'w') as f:
    f.write(new_content)
print("Done")

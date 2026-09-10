with open('backend/telegram_dev_poller.py', 'r', encoding='utf-8') as f: content = f.read()
patch = 'import socket\\nold_getaddrinfo = socket.getaddrinfo\\ndef new_getaddrinfo(*args, **kwargs):\\n    responses = old_getaddrinfo(*args, **kwargs)\\n    return [response for response in responses if response[0] == socket.AF_INET]\\nsocket.getaddrinfo = new_getaddrinfo\\n'
content = patch + content
with open('backend/telegram_dev_poller.py', 'w', encoding='utf-8') as f: f.write(content)

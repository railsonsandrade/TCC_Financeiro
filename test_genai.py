import google.generativeai as genai

genai.configure(api_key="AIzaSyB4OIOa6qOQdPJg3NAD0rdenTO71LZF_yA")
print("Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)

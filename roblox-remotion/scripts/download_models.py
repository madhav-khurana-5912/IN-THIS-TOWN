"""Download Kokoro ONNX model and voice vectors if missing."""
import os
import urllib.request

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))

FILES = {
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}

def main():
    os.makedirs(MODELS_DIR, exist_ok=True)
    for filename, url in FILES.items():
        dest = os.path.join(MODELS_DIR, filename)
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print(f"✓ {filename} already exists ({os.path.getsize(dest)} bytes)")
            continue
        print(f"Downloading {filename} from {url}...")
        urllib.request.urlretrieve(url, dest)
        print(f"✓ Downloaded {filename} to {dest}")

if __name__ == "__main__":
    main()

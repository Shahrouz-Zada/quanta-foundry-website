import sys
from rembg import remove
from PIL import Image

def main():
    input_path = "public/images/logo.jpg"
    output_path = "public/images/logo-transparent.png"
    
    try:
        input_image = Image.open(input_path)
        print("Removing background...")
        output_image = remove(input_image)
        output_image.save(output_path)
        print("Successfully saved to:", output_path)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()

from PIL import Image, ImageDraw, ImageFilter

def make_roundy_box(input_path, output_path, padding=32):
    # Open the original logo
    original = Image.open(input_path).convert("RGBA")
    
    # Target size for the actual logo inside the box
    final_size = 512
    box_size = final_size - (padding * 2)
    
    # Create the round box mask
    mask = Image.new("L", (box_size, box_size), 0)
    draw = ImageDraw.Draw(mask)
    # 30% border radius
    radius = int(box_size * 0.3)
    draw.rounded_rectangle((0, 0, box_size, box_size), radius=radius, fill=255)
    
    # Resize original to fit in the box. 
    # To keep its aspect ratio and center it, we use thumbnail
    original.thumbnail((box_size, box_size), Image.Resampling.LANCZOS)
    
    # Create the box background (White)
    box_bg = Image.new("RGBA", (box_size, box_size), (255, 255, 255, 255))
    
    # Paste original onto the box bg, centered
    offset_x = (box_size - original.width) // 2
    offset_y = (box_size - original.height) // 2
    
    # Use the original image itself as a mask if it has transparency
    box_bg.paste(original, (offset_x, offset_y), original)
    
    # Apply the rounded mask to the box
    box_bg.putalpha(mask)
    
    # Now draw a 10% opacity primary color border (#A78BFA)
    border_layer = Image.new("RGBA", (box_size, box_size), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border_layer)
    # RGBA for #A78BFA at 10% opacity: A7=167, 8B=139, FA=250. Let's make it 15% opacity to be slightly more visible in small sizes (40)
    b_draw.rounded_rectangle((0, 0, box_size-1, box_size-1), radius=radius, outline=(167, 139, 250, 60), width=4)
    
    # Combine the border and box_bg
    box_bg = Image.alpha_composite(box_bg, border_layer)
    
    # Create the final canvas with transparency
    canvas = Image.new("RGBA", (final_size, final_size), (0, 0, 0, 0))
    
    # Add a shadow layer
    shadow_layer = Image.new("RGBA", (final_size, final_size), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.rounded_rectangle((padding, padding+8, padding+box_size, padding+box_size+8), radius=radius, fill=(0, 0, 0, 20))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(16))
    
    # Paste shadow onto canvas
    canvas = Image.alpha_composite(canvas, shadow_layer)
    
    # Paste the box onto canvas
    canvas.paste(box_bg, (padding, padding), box_bg)
    
    # Save as PNG
    canvas.save(output_path, "PNG")

make_roundy_box("public/logo.png", "src/app/icon.png")
print("Successfully created stylized icon.png")
